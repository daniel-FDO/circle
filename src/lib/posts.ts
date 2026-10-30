import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import type { FeedPost } from "../data/posts";
import { supabase } from "./supabase";

const FEED_LIMIT = 30;

// posts links to profiles twice (author_id, and through likes), so the author join names its foreign key
const FEED_COLUMNS =
  "id, content, created_at, author_id, profiles!posts_author_id_fkey(username, display_name), likes(user_id)";

// Postgres unique_violation: the (user_id, post_id) like already exists
const UNIQUE_VIOLATION = "23505";

type PostRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: { username: string; display_name: string } | null;
  // Only the like rows RLS lets this user read
  likes: { user_id: string }[] | null;
};

const minutesSince = (iso: string) => Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));

// Maps a database row onto the card shape; columns the table doesn't have yet get neutral values.
// Cards show likes + (liked ? 1 : 0), so `likes` leaves out the user's own like.
const toFeedPost = (row: PostRow, userId: string | null, likedByMe: boolean): FeedPost => ({
  id: row.id,
  author: row.profiles?.display_name ?? "Circle member",
  handle: row.profiles?.username ?? "unknown",
  role: "",
  minutesAgo: minutesSince(row.created_at),
  topics: [],
  body: row.content,
  likes: (row.likes?.length ?? 0) - (likedByMe ? 1 : 0),
  replies: 0,
  reposts: 0,
  mine: userId !== null && row.author_id === userId,
});

export type FeedPage = { posts: FeedPost[]; liked: Set<string> };

// Newest first, with each post's like rows; RLS decides which rows come back
export const fetchFeedPosts = async (): Promise<FeedPage> => {
  const [{ data, error }, { data: auth }] = await Promise.all([
    supabase.from("posts").select(FEED_COLUMNS).order("created_at", { ascending: false }).limit(FEED_LIMIT),
    supabase.auth.getSession(),
  ]);
  if (error) throw error;
  const userId = auth.session?.user.id ?? null;
  const liked = new Set<string>();
  const posts = ((data ?? []) as unknown as PostRow[]).map((row) => {
    const likedByMe = userId !== null && (row.likes ?? []).some((like) => like.user_id === userId);
    if (likedByMe) liked.add(row.id);
    return toFeedPost(row, userId, likedByMe);
  });
  return { posts, liked };
};

export class SignedOutError extends Error {}

// Network failures stay ordinary errors; a missing or rejected session means signed out
const currentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (isAuthRetryableFetchError(error)) throw error;
  if (error || !data.user) throw new SignedOutError("Sign in to continue");
  return data.user;
};

// RLS only accepts rows whose author_id is the caller's own auth.uid()
export const createPost = async (content: string) => {
  const user = await currentUser();
  const { error } = await supabase.from("posts").insert({ author_id: user.id, content });
  if (error) throw error;
};

// Likes or unlikes as the signed-in user; resolves once public.likes matches `like`
export const setPostLike = async (postId: string, like: boolean) => {
  const user = await currentUser();
  if (like) {
    const { error } = await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
    // The unique key already holds this like (e.g. from another tab), which is the state we want
    if (error && error.code !== UNIQUE_VIOLATION) throw error;
  } else {
    const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
    if (error) throw error;
  }
};
