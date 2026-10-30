import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import Composer from "../components/home/Composer";
import FeedList, { type LikeSource } from "../components/home/FeedList";
import PageHeader from "../components/home/PageHeader";
import { card } from "../components/home/styles";
import { SlidersIcon } from "../components/Icons";
import { featuredTopics } from "../data/topics";
import { useFeed, type ComposeState } from "../layouts/feedContext";
import { createPost, fetchFeedPosts, setPostLike, SignedOutError, type FeedPage } from "../lib/posts";

type Tab = "forYou" | "following";
type Order = "curated" | "latest";

const tabs: [Tab, string][] = [
  ["forYou", "For you"],
  ["following", "Following"],
];

type FeedState = { status: "loading" } | { status: "error" } | ({ status: "ready" } & FeedPage);

type LikeError = "signed-out" | "failed";

const withMember = (set: Set<string>, id: string, member: boolean) => {
  const next = new Set(set);
  if (member) next.add(id);
  else next.delete(id);
  return next;
};

const FeedSkeleton = () => (
  <div aria-busy="true" className="space-y-4">
    <p role="status" className="sr-only">
      Loading posts…
    </p>
    {[0, 1, 2].map((i) => (
      <div key={i} className={`${card} p-4 animate-pulse`} aria-hidden>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-high" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-surface-high" />
            <div className="h-2.5 w-1/5 rounded bg-surface-low" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded bg-surface-low" />
          <div className="h-3 w-4/5 rounded bg-surface-low" />
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const { profile, curation, following, hidden } = useFeed();
  const [feedState, setFeedState] = useState<FeedState>({ status: "loading" });
  const [reloads, setReloads] = useState(0);
  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const [likeError, setLikeError] = useState<LikeError | null>(null);
  // Read synchronously so a fast double click can't start a second request before re-render
  const likesInFlight = useRef(new Set<string>());
  const [tab, setTab] = useState<Tab>("forYou");
  const [order, setOrder] = useState<Order>("curated");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  // "Create post" navigates here with { compose: true }; key changes on every click
  useEffect(() => {
    if ((location.state as ComposeState)?.compose) {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [location.key, location.state]);

  useEffect(() => {
    let active = true;
    fetchFeedPosts()
      .then((page) => {
        if (active) setFeedState({ status: "ready", ...page });
      })
      .catch(() => {
        if (active) setFeedState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [reloads]);

  const retry = () => {
    setFeedState({ status: "loading" });
    setReloads((n) => n + 1);
  };

  const publish = async (body: string) => {
    try {
      await createPost(body);
    } catch {
      return "We couldn't publish your post. Your draft is still here, so please try again.";
    }
    setTab("forYou");
    // The post is saved either way; a failed refresh shows the feed's own retry
    try {
      setFeedState({ status: "ready", ...(await fetchFeedPosts()) });
    } catch {
      setFeedState({ status: "error" });
    }
    return null;
  };

  const toggleLike = async (postId: string) => {
    if (feedState.status !== "ready" || likesInFlight.current.has(postId)) return;
    const like = !feedState.liked.has(postId);
    likesInFlight.current.add(postId);
    setLikePending((s) => withMember(s, postId, true));
    setLikeError(null);
    try {
      await setPostLike(postId, like);
      // Applied to the latest state, which a feed refresh may have replaced meanwhile
      setFeedState((s) => (s.status === "ready" ? { ...s, liked: withMember(s.liked, postId, like) } : s));
    } catch (error) {
      setLikeError(error instanceof SignedOutError ? "signed-out" : "failed");
    } finally {
      likesInFlight.current.delete(postId);
      setLikePending((s) => withMember(s, postId, false));
    }
  };

  const likes: LikeSource | undefined =
    feedState.status === "ready" ? { liked: feedState.liked, pending: likePending, toggle: toggleLike } : undefined;

  // Own posts use the avatar from this browser's profile; the posts table has no avatar yet
  const posts =
    feedState.status === "ready"
      ? feedState.posts
          .filter((p) => !hidden.has(p.id))
          .map((p) => (p.mine ? { ...p, avatar: profile.avatar } : p))
      : [];

  let feed;
  if (tab === "following") {
    feed = posts.filter((p) => p.mine || following.has(p.handle));
  } else {
    // For you: only posts from the user's chosen circles, falling back to everything
    const curated = posts.filter((p) => p.mine || p.topics.some((t) => curation.topics.includes(t)));
    feed = curated.some((p) => !p.mine) ? curated : posts;
  }
  if (order === "latest") feed = [...feed].sort((a, b) => a.minutesAgo - b.minutesAgo);

  return (
    <>
      <PageHeader>
        <div className={`${card} flex items-center justify-between gap-2 px-2 h-12`}>
          <h1 className="sr-only">Home</h1>
          <div role="tablist" aria-label="Feed" className="flex items-center gap-1 h-full">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative h-full px-3 text-sm transition ${
                  tab === id ? "font-bold text-on-surface" : "font-medium text-muted hover:text-on-surface"
                }`}
              >
                {label}
                {tab === id && <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOrder((o) => (o === "curated" ? "latest" : "curated"))}
            aria-label={`Sort: ${order === "curated" ? "curated stream" : "latest first"}. Click to switch.`}
            className="flex items-center gap-2 h-9 px-3 rounded-full text-xs font-semibold text-on-surface-variant bg-surface-low hover:bg-surface-high"
          >
            {order === "curated" ? "Curated stream" : "Latest first"}
            <SlidersIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </PageHeader>

      <div className="space-y-4">
        <Composer
          profile={profile}
          topicOptions={curation.topics.length ? curation.topics : featuredTopics}
          textareaRef={composerRef}
          textOnly
          onPublish={(draft) => publish(draft.body)}
        />
        {feedState.status === "loading" ? (
          <FeedSkeleton />
        ) : feedState.status === "error" ? (
          <div role="alert" className={`${card} p-8 text-center`}>
            <p className="text-sm text-on-surface-variant">We couldn't load the feed. Check your connection and try again.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 h-9 px-5 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {likeError && (
              <p role="alert" className={`${card} px-4 py-3 text-sm font-semibold text-red-600`}>
                {likeError === "signed-out" ? (
                  <>
                    Your session has ended.{" "}
                    <Link to="/sign-in" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to like posts.
                  </>
                ) : (
                  "We couldn't update that like. Please try again."
                )}
              </p>
            )}
            <FeedList
              likes={likes}
              posts={feed}
              emptyMessage={
                tab === "following" ? "Follow a few people to fill this tab." : "No posts yet — start the conversation."
              }
            />
          </>
        )}
      </div>
    </>
  );
};

export default Home;
