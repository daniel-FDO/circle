import { useState, type ReactNode } from "react";
import Avatar from "../Avatar";
import FallbackImage from "../FallbackImage";
import AudioPlayer from "./AudioPlayer";
import { HeartIcon, RepeatIcon, ReplyIcon, ShareIcon } from "../Icons";
import type {
  ArticleEntry,
  NoteEntry,
  ProfileEntry,
  RepostEntry,
  VisualEntry,
} from "../../data/profileSamples";
import type { Profile } from "../../types";

const cardClass = "bg-white border border-line rounded-xl p-4 md:p-5 shadow-[0_1px_2px_rgba(30,27,25,0.04)]";

export const SampleTag = () => (
  <span
    className="px-1.5 py-px rounded border border-dashed border-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted"
    title="Demonstration content, not real account activity"
  >
    Sample
  </span>
);

const Tags = ({ tags }: { tags: string[] }) => (
  <div className="mt-3 flex flex-wrap gap-1.5">
    {tags.map((t) => (
      <span key={t} className="px-1.5 py-px rounded bg-primary-soft text-primary text-xs font-semibold">
        #{t}
      </span>
    ))}
  </div>
);

type ActionsProps = {
  entry: ProfileEntry;
  liked: boolean;
  onLike: () => void;
  shareText: string;
};

// Likes and copying work locally; reply/repost totals are display-only for sample entries
const Actions = ({ entry, liked, onLike, shareText }: ActionsProps) => {
  const [copied, setCopied] = useState(false);
  const likes = entry.likes + (liked ? 1 : 0);
  return (
    <div className="mt-4 pt-3 border-t border-line flex items-center gap-5 text-[13px] text-on-surface-variant">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        aria-label={`${liked ? "Unlike" : "Like"} (${likes} likes)`}
        className={`inline-flex items-center gap-1.5 h-9 px-2 -mx-2 rounded-full transition hover:bg-surface-low ${
          liked ? "text-rose-600" : "hover:text-rose-600"
        }`}
      >
        <HeartIcon filled={liked} /> {likes}
      </button>
      <span className="inline-flex items-center gap-1.5">
        <ReplyIcon /> {entry.replies}
        <span className="sr-only">replies</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RepeatIcon /> {entry.reposts}
        <span className="sr-only">reposts</span>
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard unavailable; nothing to do
          }
        }}
        aria-label="Copy text to share"
        className="ml-auto inline-flex items-center gap-1.5 h-9 px-2 -mx-2 rounded-full hover:bg-surface-low hover:text-primary"
      >
        <ShareIcon />
        {copied && <span className="text-xs font-semibold text-primary">Copied</span>}
      </button>
    </div>
  );
};

type CardProps<T> = {
  entry: T;
  profile: Profile;
  liked: boolean;
  onLike: () => void;
};

const Byline = ({ profile, entry, extra }: { profile: Profile; entry: ProfileEntry; extra?: ReactNode }) => (
  <header className="flex items-center gap-3">
    <Avatar name={profile.displayName} src={profile.avatar} className="w-9 h-9 text-xs" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate">{profile.displayName}</p>
      <p className="text-xs text-muted truncate">
        {extra}
        {entry.date}
      </p>
    </div>
    <SampleTag />
  </header>
);

export const ArticleCard = ({ entry, profile, liked, onLike }: CardProps<ArticleEntry>) => (
  <article className={cardClass}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{entry.category}</p>
      <SampleTag />
    </div>
    <h2 className="font-serif mt-2 text-2xl md:text-[28px] font-semibold leading-tight">{entry.title}</h2>
    <p className="mt-1 text-xs text-muted">
      {profile.displayName} · {entry.date} · {entry.readTime}
    </p>

    <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-on-surface">
      <p className="first-letter:float-left first-letter:font-serif first-letter:text-[52px] first-letter:leading-[0.85] first-letter:font-semibold first-letter:text-primary first-letter:mr-2 first-letter:mt-1">
        {entry.paragraphs[0]}
      </p>
      {entry.paragraphs.slice(1).map((p) => (
        <p key={p.slice(0, 20)}>{p}</p>
      ))}
      <blockquote className="my-4 border-l-[3px] border-primary bg-primary-soft/50 rounded-r-lg px-4 py-3 font-serif italic text-lg leading-snug text-on-surface">
        “{entry.quote}”
      </blockquote>
      <p>{entry.closing}</p>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-1.5 h-48 sm:h-60 rounded-lg overflow-hidden">
      {entry.images.map((img) => (
        <FallbackImage key={img.src} image={img} className="w-full h-full" />
      ))}
    </div>
    <Tags tags={entry.tags} />
    <Actions entry={entry} liked={liked} onLike={onLike} shareText={`${entry.title}: ${entry.paragraphs[0]}`} />
  </article>
);

export const VisualCard = ({ entry, profile, liked, onLike }: CardProps<VisualEntry>) => (
  <article className={cardClass}>
    <Byline profile={profile} entry={entry} extra={`${entry.place} · `} />
    <p className="mt-3 text-[15px] leading-relaxed">{entry.body}</p>
    <div className="mt-3 grid grid-cols-3 gap-1.5 h-36 sm:h-44 rounded-lg overflow-hidden">
      {entry.images.map((img) => (
        <FallbackImage key={img.src} image={img} className="w-full h-full" />
      ))}
    </div>
    {entry.audio && <AudioPlayer {...entry.audio} />}
    <Tags tags={entry.tags} />
    <Actions entry={entry} liked={liked} onLike={onLike} shareText={entry.body} />
  </article>
);

export const RepostCard = ({ entry, profile, liked, onLike }: CardProps<RepostEntry>) => (
  <article className={cardClass}>
    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
      <RepeatIcon className="w-3.5 h-3.5" /> {profile.displayName} reposted from {entry.original.author}
    </p>
    <div className="mt-3">
      <Byline profile={profile} entry={entry} />
    </div>
    <p className="mt-3 text-[15px] leading-relaxed">{entry.comment}</p>
    <blockquote className="mt-3 rounded-lg border border-line bg-surface-low p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={entry.original.author} className="w-8 h-8 text-[11px]" />
        <p className="text-sm min-w-0 truncate">
          <span className="font-bold">{entry.original.author}</span>{" "}
          <span className="text-muted">
            @{entry.original.handle} · {entry.original.time}
          </span>
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{entry.original.body}</p>
    </blockquote>
    <Tags tags={entry.tags} />
    <Actions entry={entry} liked={liked} onLike={onLike} shareText={`${entry.comment} — quoting ${entry.original.author}`} />
  </article>
);

export const NoteCard = ({ entry, profile, liked, onLike }: CardProps<NoteEntry>) => (
  <article className={cardClass}>
    <Byline profile={profile} entry={entry} />
    <p className="mt-3 text-[15px] leading-relaxed">{entry.body}</p>
    <Tags tags={entry.tags} />
    <Actions entry={entry} liked={liked} onLike={onLike} shareText={entry.body} />
  </article>
);

export const EntryCard = (props: CardProps<ProfileEntry>) => {
  const { entry } = props;
  switch (entry.kind) {
    case "article":
      return <ArticleCard {...props} entry={entry} />;
    case "visual":
      return <VisualCard {...props} entry={entry} />;
    case "repost":
      return <RepostCard {...props} entry={entry} />;
    default:
      return <NoteCard {...props} entry={entry} />;
  }
};
