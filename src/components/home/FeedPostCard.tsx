import { useState } from "react";
import Avatar from "../Avatar";
import FallbackImage from "../FallbackImage";
import {
  BookmarkIcon,
  HeartIcon,
  MoreIcon,
  PlayIcon,
  ReplyIcon,
  RepeatIcon,
  ShareIcon,
} from "../Icons";
import type { FeedPost, PostMedia } from "../../data/posts";
import type { Profile } from "../../types";

export type Reply = { id: string; text: string };

const timeAgo = (m: number) => {
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
};

const hashtag = (topic: string) => `#${topic.replace(/[^A-Za-z0-9]/g, "")}`;

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Fixed bar heights so the waveform looks the same on every render
const waveform = [4, 8, 12, 7, 15, 10, 18, 12, 9, 14, 20, 16, 11, 7, 13, 18, 22, 15, 10, 6, 12, 17, 13, 8, 5, 10, 15, 11, 7, 4, 9, 14, 18, 12, 8, 5];

const Media = ({ media }: { media: PostMedia }) => {
  const [copied, setCopied] = useState(false);

  if (media.type === "images") {
    const [first, ...rest] = media.images;
    if (rest.length === 0) {
      return <FallbackImage image={first} className="mt-3 w-full aspect-[16/9] rounded-lg" />;
    }
    return (
      <div className="mt-3 grid grid-cols-[1.35fr_1fr] grid-rows-2 gap-1.5 h-64 sm:h-80 rounded-lg overflow-hidden">
        <FallbackImage image={first} className="row-span-2 w-full h-full" />
        {rest.slice(0, 2).map((img) => (
          <FallbackImage key={img.src} image={img} className="w-full h-full" />
        ))}
      </div>
    );
  }

  if (media.type === "code") {
    return (
      <div className="mt-3 rounded-lg border border-line bg-surface-low overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-line">
          <span className="font-mono text-xs text-on-surface-variant">{media.filename}</span>
          <button
            type="button"
            onClick={async () => {
              if (await copyText(media.code)) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }
            }}
            className="text-[11px] font-bold uppercase tracking-wider text-muted hover:text-primary px-1"
          >
            {copied ? "Copied" : "Copy snippet"}
          </button>
        </div>
        <pre className="px-3 py-3 overflow-x-auto font-mono text-[12.5px] leading-relaxed text-on-surface-variant">
          <code>
            {media.code.split("\n").map((ln, i) => (
              <span key={i} className={`block ${/^\S.*\{$/.test(ln) || ln.startsWith("export") ? "text-primary" : ""}`}>
                {ln || " "}
              </span>
            ))}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-surface-low p-3">
      <button
        type="button"
        disabled
        aria-label={`Play ${media.title} (audio preview unavailable)`}
        title="Audio preview unavailable in this prototype"
        className="w-11 h-11 shrink-0 rounded-full bg-primary text-white flex items-center justify-center opacity-50 cursor-not-allowed"
      >
        <PlayIcon className="w-4 h-4 ml-0.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold truncate">{media.title}</p>
          <span className="text-xs text-muted shrink-0">{media.duration}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-[3px] h-6" aria-hidden>
          {waveform.map((h, i) => (
            <span key={i} className="flex-1 max-w-1 rounded-full bg-primary/35" style={{ height: `${h + 2}px` }} />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted">Preview unavailable in this prototype</p>
      </div>
    </div>
  );
};

type FeedPostCardProps = {
  post: FeedPost;
  profile: Profile;
  liked: boolean;
  // True while this post's like is being saved; the button ignores clicks until it settles
  likePending?: boolean;
  saved: boolean;
  reposted: boolean;
  replies: Reply[];
  defaultReplyOpen?: boolean;
  onLike: () => void;
  onSave: () => void;
  onRepost: () => void;
  onHide: () => void;
  onReply: (text: string) => void;
  onTopic: (topic: string) => void;
};

const actionClass =
  "inline-flex items-center gap-1.5 h-9 px-2 -mx-1 rounded-full text-[13px] transition hover:bg-surface-low";

const FeedPostCard = ({
  post,
  profile,
  liked,
  likePending = false,
  saved,
  reposted,
  replies,
  defaultReplyOpen = false,
  onLike,
  onSave,
  onRepost,
  onHide,
  onReply,
  onTopic,
}: FeedPostCardProps) => {
  const [replyOpen, setReplyOpen] = useState(defaultReplyOpen);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const firstName = post.author.split(" ")[0];
  const sendReply = () => {
    if (!draft.trim()) return;
    onReply(draft.trim());
    setDraft("");
  };

  return (
    <article className="bg-white border border-line rounded-xl p-4 shadow-[0_1px_2px_rgba(30,27,25,0.04)]">
      <header className="flex items-start gap-3">
        <Avatar name={post.author} src={post.avatar} className="w-10 h-10 text-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-tight">
            <span className="font-bold text-on-surface">{post.author}</span>{" "}
            <span className="text-muted">
              @{post.handle} · {timeAgo(post.minutesAgo)}
            </span>
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
            <span>{post.role}</span>
            {post.topics.slice(0, 1).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onTopic(topic)}
                className="px-1.5 py-px rounded bg-primary-soft text-primary font-semibold hover:bg-primary/15"
              >
                {hashtag(topic)}
              </button>
            ))}
            {post.badge && (
              <span className="px-1.5 py-px rounded bg-amber-100 text-amber-800 font-semibold">
                {post.badge}
              </span>
            )}
            {post.audience && post.audience !== "Anyone can reply" && (
              <span className="text-muted">· {post.audience}</span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={`More options for ${post.author}'s post`}
            className="w-9 h-9 -mr-2 -mt-1 rounded-full flex items-center justify-center text-muted hover:bg-surface-low hover:text-on-surface"
          >
            <MoreIcon />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 w-44 bg-white border border-line rounded-lg shadow-lg py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onHide();
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface-low"
                >
                  Hide this post
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <p className="mt-3 text-[15px] leading-relaxed text-on-surface whitespace-pre-line break-words">
        {post.body}
      </p>
      {post.media && <Media media={post.media} />}

      <div className="mt-3 flex items-center justify-between text-on-surface-variant">
        <button
          type="button"
          onClick={onLike}
          disabled={likePending}
          aria-busy={likePending}
          aria-pressed={liked}
          aria-label={`${liked ? "Unlike" : "Like"} (${post.likes + (liked ? 1 : 0)} likes)`}
          className={`${actionClass} ${liked ? "text-rose-600" : "hover:text-rose-600"} disabled:opacity-60 disabled:cursor-wait`}
        >
          <HeartIcon filled={liked} /> {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          type="button"
          onClick={() => setReplyOpen((o) => !o)}
          aria-expanded={replyOpen}
          aria-label={`Reply (${post.replies + replies.length} replies)`}
          className={`${actionClass} hover:text-primary`}
        >
          <ReplyIcon /> {post.replies + replies.length}
        </button>
        <button
          type="button"
          onClick={onRepost}
          aria-pressed={reposted}
          aria-label={`${reposted ? "Undo repost" : "Repost"} (${post.reposts + (reposted ? 1 : 0)} reposts)`}
          className={`${actionClass} ${reposted ? "text-emerald-700" : "hover:text-emerald-700"}`}
        >
          <RepeatIcon /> {post.reposts + (reposted ? 1 : 0)}
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark"}
          className={`${actionClass} ${saved ? "text-primary" : "hover:text-primary"}`}
        >
          <BookmarkIcon filled={saved} />
        </button>
        <button
          type="button"
          onClick={async () => {
            if (await copyText(`${post.author} (@${post.handle}): ${post.body}`)) {
              setShared(true);
              setTimeout(() => setShared(false), 1500);
            }
          }}
          aria-label="Copy post text to share"
          title="Copy post text"
          className={`${actionClass} hover:text-primary`}
        >
          <ShareIcon />
          {shared && <span className="text-xs font-semibold text-primary">Copied</span>}
        </button>
      </div>

      {replyOpen && (
        <div className="mt-2 pt-3 border-t border-line space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2.5">
              <Avatar name={profile.displayName} src={profile.avatar} className="w-7 h-7 text-[11px]" />
              <p className="text-sm bg-surface-low rounded-lg px-3 py-2 flex-1 min-w-0 break-words">
                <span className="font-bold">{profile.displayName}</span> {reply.text}
              </p>
            </div>
          ))}
          <form
            className="flex items-center gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              sendReply();
            }}
          >
            <Avatar name={profile.displayName} src={profile.avatar} className="w-7 h-7 text-[11px]" />
            <label htmlFor={`reply-${post.id}`} className="sr-only">
              Reply to {post.author}
            </label>
            <input
              id={`reply-${post.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Reply to ${firstName}...`}
              className="flex-1 min-w-0 h-9 rounded-full bg-surface-low border border-line px-4 text-sm outline-none focus:border-primary/40 focus:bg-white"
            />
            {draft.trim() && (
              <button type="submit" className="h-9 px-4 rounded-full bg-primary text-white text-xs font-bold">
                Reply
              </button>
            )}
          </form>
        </div>
      )}
    </article>
  );
};

export default FeedPostCard;
