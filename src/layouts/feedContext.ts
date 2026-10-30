import { useOutletContext } from "react-router";
import type { Draft } from "../components/home/Composer";
import type { Reply } from "../components/home/FeedPostCard";
import type { ChatMessage, Conversation } from "../data/messages";
import type { FeedPost } from "../data/posts";
import type { BookmarkStore } from "../lib/bookmarks";
import type { FeedNotification, NotificationStore, Rsvp } from "../lib/notifications";
import type { Curation, Profile } from "../types";

// Shared by every page inside AppLayout so likes, bookmarks and posts survive navigation
export type FeedContext = {
  profile: Profile;
  curation: Curation;
  joinedAt: string | null;
  onProfileChange: (profile: Profile) => void;
  onCurationChange: (curation: Curation) => void;

  posts: FeedPost[];
  following: Set<string>;
  toggleFollow: (handle: string) => void;
  liked: Set<string>;
  saved: Set<string>;
  reposted: Set<string>;
  replies: Record<string, Reply[]>;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  // Saved times and shelves behind `saved`, persisted in this browser
  bookmarks: BookmarkStore;
  restoreBookmark: (id: string, savedAt: string) => void;
  createShelf: (name: string, itemIds: string[]) => string;
  toggleRepost: (id: string) => void;
  // Ids hidden with "Hide this post"; Home applies it to posts loaded from Supabase
  hidden: Set<string>;
  hidePost: (id: string) => void;
  addReply: (id: string, text: string) => void;
  publish: (draft: Draft) => void;

  query: string;
  setQuery: (query: string) => void;
  topicFilter: string | null;
  setTopicFilter: (topic: string | null) => void;
  filterByTopic: (topic: string) => void;

  // Demo messaging: conversations with the user's locally saved messages merged in
  conversations: Conversation[];
  sendMessage: (conversationId: string, message: Pick<ChatMessage, "text" | "attachment">) => void;

  // Demo notifications with locally saved read state, RSVPs, replies and preferences
  notifications: FeedNotification[];
  notificationStore: NotificationStore;
  markNotificationsRead: (ids: string[]) => void;
  setRsvp: (salonId: string, rsvp: Rsvp) => void;
  addNotificationReply: (id: string, text: string) => void;
  setQuietDigest: (on: boolean) => void;
};

// Router state used by "Send welcome note" to prefill a message draft
export type MessageDraftState = { draft?: string } | null;

export const useFeed = () => useOutletContext<FeedContext>();

// Router state used by "Create post" to ask the home page to focus its composer
export type ComposeState = { compose?: boolean } | null;
