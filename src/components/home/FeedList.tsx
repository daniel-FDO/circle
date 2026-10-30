import FeedPostCard from "./FeedPostCard";
import { CloseIcon } from "../Icons";
import { useFeed } from "../../layouts/feedContext";
import type { FeedPost } from "../../data/posts";
import { card } from "./styles";

// Lets a page supply likes stored elsewhere (Home uses Supabase) instead of the local context
export type LikeSource = {
  liked: Set<string>;
  pending: Set<string>;
  toggle: (postId: string) => void;
};

type FeedListProps = {
  posts: FeedPost[];
  emptyMessage: string;
  likes?: LikeSource;
};

// Applies the shared search and topic filters, then renders the posts
const FeedList = ({ posts, emptyMessage, likes }: FeedListProps) => {
  const feed = useFeed();
  const { query, topicFilter } = feed;

  const q = query.trim().toLowerCase();
  let visible = topicFilter ? posts.filter((p) => p.topics.includes(topicFilter)) : posts;
  if (q) {
    visible = visible.filter((p) =>
      [p.author, p.handle, p.role, p.body, ...p.topics].some((s) => s.toLowerCase().includes(q)),
    );
  }

  return (
    <>
      {(topicFilter || q) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Showing</span>
          {topicFilter && (
            <button
              type="button"
              onClick={() => feed.setTopicFilter(null)}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 h-7 rounded-full bg-primary-soft text-primary text-xs font-semibold"
              aria-label={`Clear topic filter ${topicFilter}`}
            >
              {topicFilter} <CloseIcon className="w-3 h-3" />
            </button>
          )}
          {q && (
            <button
              type="button"
              onClick={() => feed.setQuery("")}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 h-7 rounded-full bg-surface-high text-on-surface text-xs font-semibold"
              aria-label="Clear search"
            >
              “{query.trim()}” <CloseIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <p className={`${card} p-8 text-center text-sm text-muted`}>
          {q || topicFilter ? "No posts match these filters." : emptyMessage}
        </p>
      ) : (
        visible.map((post, i) => (
          <FeedPostCard
            key={post.id}
            post={post}
            profile={feed.profile}
            liked={(likes?.liked ?? feed.liked).has(post.id)}
            likePending={likes?.pending.has(post.id)}
            saved={feed.saved.has(post.id)}
            reposted={feed.reposted.has(post.id)}
            replies={feed.replies[post.id] ?? []}
            defaultReplyOpen={i === 0 && !post.mine}
            onLike={() => (likes ? likes.toggle(post.id) : feed.toggleLike(post.id))}
            onSave={() => feed.toggleSave(post.id)}
            onRepost={() => feed.toggleRepost(post.id)}
            onHide={() => feed.hidePost(post.id)}
            onReply={(text) => feed.addReply(post.id, text)}
            onTopic={feed.filterByTopic}
          />
        ))
      )}
    </>
  );
};

export default FeedList;
