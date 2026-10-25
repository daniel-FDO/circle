import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import Avatar from "../Avatar";
import AudioPlayer from "../profile/AudioPlayer";
import { card } from "../home/styles";
import {
  ArrowIcon,
  BookmarkIcon,
  CheckIcon,
  LinkIcon,
  MapPinIcon,
  ReplyIcon,
  SparkIcon,
} from "../Icons";
import type { Person, Salon } from "../../data/notifications";
import { salons } from "../../data/notifications";
import type { MessageDraftState } from "../../layouts/feedContext";
import { useFeed } from "../../layouts/feedContext";
import { relativeTime, salonDay, salonTime, type FeedNotification } from "../../lib/notifications";

const pill = "h-9 px-4 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 transition";
const primaryPill = `${pill} bg-primary text-white hover:brightness-110 disabled:opacity-50`;
const quietPill = `${pill} bg-surface-high text-on-surface-variant hover:bg-line hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface-high`;
const contentLink = "font-semibold text-primary underline-offset-2 hover:underline";
const quoteBox = "rounded-lg bg-surface-low border border-line/70 px-4 py-3 text-sm leading-relaxed text-on-surface-variant italic";

const Names = ({ people }: { people: Person[] }) => (
  <>
    {people.map((p, i) => (
      <Fragment key={p.handle}>
        {i === 0 ? "" : i === people.length - 1 ? " and " : ", "}
        <span className="font-bold text-on-surface">{p.name}</span>
      </Fragment>
    ))}
  </>
);

const Stack = ({ people }: { people: Person[] }) => (
  <span className="flex -space-x-2 shrink-0" aria-hidden>
    {people.slice(0, 3).map((p) => (
      <span key={p.handle} className="rounded-full ring-2 ring-white">
        <Avatar name={p.name} className="w-9 h-9 text-xs" />
      </span>
    ))}
  </span>
);

type ShellProps = {
  n: FeedNotification;
  avatar: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

// Shared frame: unread accent and label, avatar column, timestamp, and a mark-as-read control
const Shell = ({ n, avatar, meta, children, actions }: ShellProps) => {
  const { markNotificationsRead } = useFeed();
  return (
    <article
      aria-labelledby={`${n.id}-title`}
      className={`${card} relative p-4 sm:p-5 ${n.unread ? "border-l-[3px] border-l-primary" : ""}`}
    >
      <div className="flex gap-3">
        {avatar}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">{meta}</div>
            <span className="shrink-0 flex items-center gap-2 text-xs text-muted">
              {n.unread && (
                <span className="h-[18px] px-1.5 rounded-full bg-primary-soft text-primary text-[10px] font-bold leading-[18px] uppercase tracking-wide">
                  New
                </span>
              )}
              <time dateTime={n.at}>{relativeTime(n.at)}</time>
            </span>
          </div>
          <div id={`${n.id}-title`} className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {n.unread && <span className="sr-only">Unread: </span>}
            {children}
          </div>
        </div>
      </div>
      {(actions || n.unread) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:pl-12">
          {actions}
          {n.unread && (
            <button
              type="button"
              onClick={() => markNotificationsRead([n.id])}
              className="ml-auto h-9 px-3 rounded-full text-xs font-semibold text-muted hover:text-primary hover:bg-surface-low inline-flex items-center gap-1.5"
            >
              <CheckIcon className="w-3 h-3" />
              Mark as read
            </button>
          )}
        </div>
      )}
    </article>
  );
};

const Identity = ({ person }: { person: Person }) => (
  <>
    <span className="text-sm font-bold text-on-surface">{person.name}</span>
    <span className="text-xs text-muted">@{person.handle}</span>
    {person.role && (
      <span className="h-5 px-2 rounded-md bg-surface-high text-[10px] font-semibold text-on-surface-variant leading-5">
        {person.role}
      </span>
    )}
  </>
);

// Links inside a card also mark it read; they're real links, so they navigate as usual
const ContentLink = ({ n, to, children }: { n: FeedNotification; to: string; children: ReactNode }) => {
  const { markNotificationsRead } = useFeed();
  return (
    <Link to={to} onClick={() => markNotificationsRead([n.id])} className={contentLink}>
      {children}
    </Link>
  );
};

const Unavailable = ({ label, reason }: { label: string; reason: string }) => (
  <button type="button" disabled title={reason} className={quietPill}>
    {label}
    <span className="sr-only"> ({reason})</span>
  </button>
);

const ReplyCard = ({ n }: { n: Extract<FeedNotification, { kind: "reply" }> }) => {
  const { notificationStore, addNotificationReply } = useFeed();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const replies = notificationStore.replies[n.id] ?? [];
  const formId = `${n.id}-reply`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNotificationReply(n.id, text.trim());
    setText("");
    setOpen(false);
  };

  return (
    <Shell
      n={n}
      avatar={<Avatar name={n.actor.name} className="w-9 h-9 text-xs" />}
      meta={<Identity person={n.actor} />}
      actions={
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={formId}
            className={primaryPill}
          >
            <ReplyIcon className="w-3.5 h-3.5" />
            Reply directly
          </button>
          <Unavailable label="View full thread" reason="Threads aren't available in this prototype yet" />
        </>
      }
    >
      <p>
        replied to your essay{" "}
        <ContentLink n={n} to={n.target.to}>
          {n.target.title}
        </ContentLink>
      </p>
      <blockquote className={`mt-3 ${quoteBox}`}>“{n.quote}”</blockquote>
      <Link
        to={n.resource.to}
        className="mt-3 flex items-center gap-3 rounded-lg border border-line p-2.5 hover:border-primary/40 hover:bg-surface-low transition not-italic"
      >
        <span className="w-9 h-9 shrink-0 rounded-md bg-primary-soft text-primary flex items-center justify-center">
          <BookmarkIcon />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold text-on-surface truncate">{n.resource.title}</span>
          <span className="block text-xs text-muted truncate">{n.resource.meta}</span>
        </span>
        <ArrowIcon className="w-4 h-4 text-muted shrink-0" />
      </Link>

      {replies.length > 0 && (
        <ul className="mt-3 space-y-2">
          {replies.map((r) => (
            <li key={r.id} className="rounded-lg bg-primary-soft/60 px-3 py-2 text-sm text-on-surface">
              <span className="block text-[11px] font-semibold text-primary">
                Your reply · saved on this device, not delivered
              </span>
              {r.text}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form id={formId} onSubmit={submit} className="mt-3 space-y-2">
          <label htmlFor={`${formId}-text`} className="sr-only">
            Reply to {n.actor.name}
          </label>
          <textarea
            id={`${formId}-text`}
            autoFocus
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Reply to ${n.actor.name.split(" ")[0]}…`}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-on-surface placeholder:text-muted focus:border-primary/50 outline-none resize-y"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={!text.trim()} className={primaryPill}>
              Save reply
            </button>
            <button type="button" onClick={() => setOpen(false)} className={quietPill}>
              Cancel
            </button>
            <span className="text-[11px] text-muted">Demo: replies stay in this browser.</span>
          </div>
        </form>
      )}
    </Shell>
  );
};

export const DateTile = ({ salon, size = "lg" }: { salon: Salon; size?: "lg" | "sm" }) => {
  const { weekday, day, month } = salonDay(salon);
  return (
    <span
      className={`shrink-0 rounded-lg bg-primary-soft text-primary flex flex-col items-center justify-center leading-none ${
        size === "lg" ? "w-14 h-14" : "w-10 h-11"
      }`}
      aria-hidden
    >
      <span className="text-[9px] font-bold uppercase tracking-wider">{size === "lg" ? weekday : month}</span>
      <span className={`${size === "lg" ? "text-xl" : "text-base"} font-bold mt-0.5`}>{day}</span>
    </span>
  );
};

const InviteCard = ({ n }: { n: Extract<FeedNotification, { kind: "invite" }> }) => {
  const { notificationStore, setRsvp, markNotificationsRead } = useFeed();
  const salon = salons.find((s) => s.id === n.salonId)!;
  const rsvp = notificationStore.rsvp[salon.id];
  const [changing, setChanging] = useState(false);
  const respond = (value: "going" | "declined") => {
    setRsvp(salon.id, value);
    markNotificationsRead([n.id]);
    setChanging(false);
  };

  return (
    <Shell
      n={n}
      avatar={<Stack people={n.actors} />}
      meta={
        <>
          <span className="h-5 px-2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold leading-5">
            Salon invitation
          </span>
          <span className="text-xs text-muted">
            by <Names people={n.actors} />
          </span>
        </>
      }
    >
      <p className="sr-only">
        {n.actors.map((a) => a.name).join(" and ")} invited you to {salon.title}.
      </p>
      <div className="mt-2 rounded-xl border border-line bg-surface-low p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <DateTile salon={salon} />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-on-surface">{salon.title}</p>
            <p className="text-xs text-muted">{salonTime(salon)}</p>
            <p className="mt-0.5 text-xs text-muted flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {salon.location} · {salon.capacity}
            </p>
          </div>
        </div>
        {rsvp && !changing ? (
          <div className="flex items-center gap-2 shrink-0" role="status">
            <span
              className={`h-9 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                rsvp === "going" ? "bg-emerald-100 text-emerald-900" : "bg-surface-high text-on-surface-variant"
              }`}
            >
              {rsvp === "going" && <CheckIcon className="w-3 h-3" />}
              {rsvp === "going" ? "You're going" : "Declined"}
            </span>
            <button type="button" onClick={() => setChanging(true)} className="text-xs font-semibold text-primary hover:underline px-1 h-9">
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" onClick={() => respond("going")} className={primaryPill}>
              Accept &amp; RSVP
            </button>
            <button type="button" onClick={() => respond("declined")} className={quietPill}>
              Decline politely
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm italic">“{n.message}”</p>
    </Shell>
  );
};

const ReactionsCard = ({ n }: { n: Extract<FeedNotification, { kind: "reactions" }> }) => (
  <Shell n={n} avatar={<Stack people={n.actors} />}>
    <p>
      <Names people={n.actors.slice(0, 2)} /> and {n.others} other curators sparked and archived your recording{" "}
      <ContentLink n={n} to={n.target.to}>
        {n.target.title}
      </ContentLink>
    </p>
    {n.audio && <AudioPlayer title={n.audio.title} meta={n.audio.meta} sources={n.audio.sources} />}
    <p className="mt-3 flex items-center gap-4 text-xs font-semibold">
      <span className="flex items-center gap-1 text-rose-700">
        <SparkIcon />
        {n.sparks} sparks
      </span>
      <span className="flex items-center gap-1 text-primary">
        <BookmarkIcon className="w-3.5 h-3.5" />
        {n.archives} archives
      </span>
    </p>
  </Shell>
);

const FollowCard = ({ n }: { n: Extract<FeedNotification, { kind: "follow" }> }) => {
  const { following, toggleFollow, markNotificationsRead } = useFeed();
  const followed = following.has(n.actor.handle);
  const welcome: MessageDraftState = { draft: n.welcome };

  return (
    <Shell
      n={n}
      avatar={<Avatar name={n.actor.name} className="w-9 h-9 text-xs" />}
      meta={<Identity person={n.actor} />}
      actions={
        <>
          <button
            type="button"
            aria-pressed={followed}
            onClick={() => {
              toggleFollow(n.actor.handle);
              markNotificationsRead([n.id]);
            }}
            className={followed ? `${quietPill} text-primary` : primaryPill}
          >
            {followed ? <CheckIcon className="w-3 h-3" /> : <span aria-hidden>+</span>}
            {followed ? "Following" : "Follow back"}
          </button>
          <Link
            to={`/messages/${n.conversationId}`}
            state={welcome}
            onClick={() => markNotificationsRead([n.id])}
            className={quietPill}
          >
            Send welcome note
          </Link>
        </>
      }
    >
      <p>started following you and your studio archive.</p>
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-line p-2.5">
        <img src={n.preview.image} alt="" className="w-12 h-12 rounded-md object-cover bg-surface-high shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold text-on-surface truncate">{n.preview.title}</span>
          <span className="block text-xs text-muted truncate">{n.preview.meta}</span>
        </span>
        <Unavailable label="View shelf" reason="Member profiles aren't available yet" />
      </div>
    </Shell>
  );
};

const CitationCard = ({ n }: { n: Extract<FeedNotification, { kind: "citation" }> }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(n.target.to, window.location.origin).href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Shell
      n={n}
      avatar={<Avatar name={n.actor.name} className="w-9 h-9 text-xs" />}
      meta={<Identity person={n.actor} />}
      actions={
        <>
          <ContentLink n={n} to={n.target.to}>
            <span className="inline-flex items-center gap-1 text-xs h-9">
              Read the cited essay <ArrowIcon className="w-3.5 h-3.5" />
            </span>
          </ContentLink>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Link to your essay copied" : "Copy link to your essay"}
            title="Copy link"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-surface-low"
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </>
      }
    >
      <p>
        cited your essay{" "}
        <ContentLink n={n} to={n.target.to}>
          {n.target.title}
        </ContentLink>{" "}
        in the journal <cite className="font-semibold text-on-surface not-italic">{n.journal}</cite>
      </p>
      <blockquote className={`mt-3 ${quoteBox}`}>“{n.quote}”</blockquote>
    </Shell>
  );
};

const ArchiveCard = ({ n }: { n: Extract<FeedNotification, { kind: "archive" }> }) => (
  <Shell
    n={n}
    avatar={<Avatar name={n.actor.name} className="w-9 h-9 text-xs" />}
    meta={<Identity person={n.actor} />}
  >
    <p>
      added your essay{" "}
      <ContentLink n={n} to={n.target.to}>
        {n.target.title}
      </ContentLink>{" "}
      to the reading list “{n.list}”.
    </p>
  </Shell>
);

const SystemCard = ({ n }: { n: Extract<FeedNotification, { kind: "system" }> }) => (
  <Shell
    n={n}
    avatar={
      <span className="relative w-9 h-9 rounded-full bg-surface-high flex items-center justify-center shrink-0" aria-hidden>
        <span className="w-3 h-3 rounded-full border-[2.5px] border-primary" />
        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
      </span>
    }
    meta={<span className="text-sm font-bold text-on-surface">Circle</span>}
    actions={
      <ContentLink n={n} to="/profile/edit">
        <span className="inline-flex items-center gap-1 text-xs h-9">
          Edit your topics <ArrowIcon className="w-3.5 h-3.5" />
        </span>
      </ContentLink>
    }
  >
    <p>
      Your circle is set up: following {n.following} {n.following === 1 ? "voice" : "voices"} across {n.topics}{" "}
      {n.topics === 1 ? "topic" : "topics"}.
    </p>
  </Shell>
);

const NotificationCard = ({ n }: { n: FeedNotification }) => {
  switch (n.kind) {
    case "reply":
      return <ReplyCard n={n} />;
    case "invite":
      return <InviteCard n={n} />;
    case "reactions":
      return <ReactionsCard n={n} />;
    case "follow":
      return <FollowCard n={n} />;
    case "citation":
      return <CitationCard n={n} />;
    case "archive":
      return <ArchiveCard n={n} />;
    case "system":
      return <SystemCard n={n} />;
  }
};

export default NotificationCard;
