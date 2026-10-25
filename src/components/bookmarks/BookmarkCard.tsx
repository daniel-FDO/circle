import { useState, type ReactNode } from "react";
import Avatar from "../Avatar";
import FallbackImage from "../FallbackImage";
import { card } from "../home/styles";
import { BookmarkIcon, CheckIcon, CodeIcon, PlayIcon } from "../Icons";
import { sampleNotes } from "../../data/bookmarkSamples";
import type { FeedPost } from "../../data/posts";
import { citationFor, hashtag, kindOf, kinds, savedLabel, splitTitle } from "../../lib/bookmarks";

// Fixed bar heights so the waveform looks the same on every render
const waveform = [5, 9, 14, 8, 16, 11, 19, 13, 9, 15, 21, 17, 12, 7, 14, 19, 22, 15, 10, 6, 12, 18, 13, 8, 5, 11, 16, 12, 7, 4, 9, 14, 18, 12, 8, 5, 10, 15, 9, 6];

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };
  return { copied, copy };
};

// Lightweight highlighter: comments, strings, keywords and numbers
const TOKEN =
  /(\/\/.*$|\/\*.*?\*\/)|("[^"]*"|'[^']*'|`[^`]*`)|\b(const|let|var|export|async|await|function|for|of|in|return|import|from|if|else|new|type)\b|(\b\d+(?:\.\d+)?(?:ms|px|s)?\b)/g;
const tokenClass = ["text-muted italic", "text-emerald-800", "text-primary font-semibold", "text-amber-800"];

const highlight = (line: string) => {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const group = m.slice(1).findIndex(Boolean);
    out.push(
      <span key={m.index} className={tokenClass[group]}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(line.slice(last));
  return out;
};

const languageOf = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext === "ts" ? "TypeScript" : ext === "js" ? "JavaScript" : ext === "css" ? "CSS" : (ext ?? "Code").toUpperCase();
};

type BookmarkCardProps = {
  post: FeedPost;
  savedAt: string;
  shelves: string[];
  compact: boolean;
  onRemove: () => void;
};

const BookmarkCard = ({ post, savedAt, shelves, compact, onRemove }: BookmarkCardProps) => {
  const citation = useCopy();
  const code = useCopy();
  const kind = kindOf(post);
  const { title, excerpt } = splitTitle(post.body);
  const note = sampleNotes[post.id];
  const media = post.media;
  const multiImage = media?.type === "images" && media.images.length > 1;
  const headingId = `bookmark-${post.id}`;

  const badge = (
    <span
      className={`h-5 px-2 rounded-md text-[10px] font-bold leading-5 shrink-0 ${
        kind === "audio"
          ? "bg-amber-100 text-amber-900"
          : kind === "code"
            ? "bg-sky-100 text-sky-900"
            : kind === "visual"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-surface-high text-on-surface-variant"
      }`}
    >
      {multiImage ? "Architecture" : kinds.find((k) => k.id === kind)?.badge}
    </span>
  );

  return (
    <article aria-labelledby={headingId} className={`${card} p-4 sm:p-5 min-w-0 flex flex-col`}>
      <header className="flex items-start gap-3">
        <Avatar name={post.author} src={post.avatar} className="w-9 h-9 text-xs" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {post.author}
            {post.mine && <span className="ml-1.5 text-[11px] font-semibold text-primary">You</span>}
          </p>
          <p className="text-xs text-muted truncate">
            {post.role} · <time dateTime={savedAt}>{savedLabel(savedAt)}</time>
          </p>
        </div>
        {badge}
        <button
          type="button"
          onClick={onRemove}
          aria-pressed
          aria-label={`Remove bookmark: ${title}`}
          title="Remove bookmark"
          className="-mt-1 -mr-1 w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-primary hover:bg-primary-soft transition"
        >
          <BookmarkIcon filled className="w-4.5 h-4.5" />
        </button>
      </header>

      <div className={`mt-3 ${multiImage && !compact ? "sm:flex sm:gap-4" : ""}`}>
        <div className="flex-1 min-w-0">
          <h2 id={headingId} className="font-serif text-lg sm:text-xl font-semibold leading-snug">
            {title}
          </h2>
          {excerpt && (
            <p className={`mt-1.5 text-sm leading-relaxed text-on-surface-variant ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
              {excerpt}
            </p>
          )}
        </div>
        {multiImage && (
          <div className={`relative shrink-0 mt-3 ${compact ? "" : "sm:mt-0 sm:w-44"}`}>
            <FallbackImage image={media.images[0]} className={`w-full rounded-lg ${compact ? "aspect-[16/9]" : "aspect-[16/9] sm:aspect-[4/3]"}`} />
            <span className="absolute right-2 bottom-2 h-5 px-1.5 rounded bg-black/60 text-white text-[10px] font-semibold leading-5">
              +{media.images.length - 1} images
            </span>
          </div>
        )}
      </div>

      {note && (
        <aside aria-label="Studio note" className="mt-3 rounded-lg bg-primary-soft/50 border-l-2 border-primary px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Studio note · sample</p>
          <p className="mt-0.5 text-[13px] italic leading-relaxed text-on-surface-variant">“{note}”</p>
        </aside>
      )}

      {media?.type === "audio" && (
        <div className="mt-3 rounded-lg bg-surface-low border border-line p-3 flex items-center gap-3">
          <button
            type="button"
            disabled
            aria-label={`Play ${media.title} (no audio file attached)`}
            className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center opacity-40 cursor-not-allowed"
          >
            <PlayIcon className="w-4 h-4 ml-0.5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold truncate">{media.title}</p>
              <span className="text-xs text-muted tabular-nums shrink-0">0:00 / {media.duration}</span>
            </div>
            <div className="mt-1.5 h-6 flex items-center gap-[3px] overflow-hidden" aria-hidden>
              {waveform.map((h, i) => (
                <span key={i} className="flex-1 min-w-[2px] rounded-full bg-primary/30" style={{ height: `${h + 2}px` }} />
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted">Preview unavailable: no audio file is attached to this post.</p>
          </div>
        </div>
      )}

      {media?.type === "code" && (
        <div className="mt-3 rounded-lg border border-line bg-surface-low overflow-hidden min-w-0">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-line">
            <span className="flex items-center gap-1.5 min-w-0 text-xs text-on-surface-variant">
              <CodeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono truncate">{media.filename}</span>
              <span className="text-muted">· {languageOf(media.filename)}</span>
            </span>
            <button
              type="button"
              onClick={() => code.copy(media.code)}
              className="h-8 px-2 rounded text-[11px] font-bold uppercase tracking-wider text-muted hover:text-primary inline-flex items-center gap-1"
            >
              {code.copied && <CheckIcon className="w-3 h-3" />}
              {code.copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className={`px-3 py-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-on-surface-variant ${compact ? "max-h-40" : "max-h-64"}`}>
            <code>
              {media.code.split("\n").map((ln, i) => (
                <span key={i} className="block">
                  {ln ? highlight(ln) : " "}
                </span>
              ))}
            </code>
          </pre>
          <span role="status" className="sr-only">
            {code.copied ? "Code copied to clipboard" : ""}
          </span>
        </div>
      )}

      {media?.type === "images" && !multiImage && (
        <FallbackImage image={media.images[0]} className="mt-3 w-full aspect-[16/9] rounded-lg" />
      )}

      <footer className="mt-auto pt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <ul className="flex flex-wrap gap-1.5 min-w-0" aria-label="Tags">
          {post.topics.map((t) => (
            <li key={t} className="h-6 px-2 rounded-md bg-surface-high text-[11px] font-medium text-on-surface-variant leading-6">
              {hashtag(t)}
            </li>
          ))}
          {shelves.map((s) => (
            <li key={s} className="h-6 px-2 rounded-md bg-primary-soft text-[11px] font-semibold text-primary leading-6">
              <span className="sr-only">Shelf: </span>
              {s}
            </li>
          ))}
        </ul>
        {kind !== "code" && (
          <button
            type="button"
            onClick={() => citation.copy(citationFor(post))}
            className="ml-auto h-8 px-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-low inline-flex items-center gap-1"
          >
            {citation.copied && <CheckIcon className="w-3 h-3" />}
            {citation.copied ? "Citation copied" : "Copy citation"}
          </button>
        )}
        <span role="status" className="sr-only">
          {citation.copied ? "Citation copied to clipboard" : ""}
        </span>
      </footer>
    </article>
  );
};

export default BookmarkCard;
