import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import Avatar from "../Avatar";
import { CheckIcon, ChevronLeftIcon, CloseIcon, DownloadIcon, ImageIcon, InfoIcon, PaperclipIcon, SendIcon } from "../Icons";
import type { ChatMessage, Conversation, MessageAttachment } from "../../data/messages";
import { fileToAvatar } from "../../lib/image";
import { formatDayLabel, formatTime, sameDay } from "../../lib/messages";
import type { Profile } from "../../types";

const iconButton =
  "w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-low hover:text-primary transition";

const AttachmentCard = ({ attachment, mine }: { attachment: MessageAttachment; mine: boolean }) => (
  <figure className={`w-72 sm:w-80 max-w-full rounded-2xl p-2 ${mine ? "bg-primary-soft" : "bg-surface-low"}`}>
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-surface-high">
      <img src={attachment.src} alt={attachment.title ?? attachment.name} loading="lazy" className="w-full h-full object-cover" />
      <span className="absolute left-2 bottom-2 max-w-[calc(100%-1rem)] flex items-center gap-1 h-6 px-2 rounded-full bg-black/60 text-white text-[11px] font-medium">
        <ImageIcon className="w-3 h-3 shrink-0" />
        <span className="truncate">{attachment.name}</span>
      </span>
    </div>
    <figcaption className="flex items-center gap-3 px-1.5 pt-2.5 pb-1">
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-bold truncate">{attachment.title ?? attachment.name}</span>
        {attachment.details && <span className="block text-xs text-muted truncate">{attachment.details}</span>}
      </span>
      <a
        href={attachment.src}
        download={attachment.name}
        aria-label={`Download ${attachment.name}`}
        title="Download"
        className="w-9 h-9 shrink-0 rounded-full bg-white border border-line flex items-center justify-center text-on-surface-variant hover:text-primary"
      >
        <DownloadIcon />
      </a>
    </figcaption>
  </figure>
);

const Message = ({ message, conversation, profile }: { message: ChatMessage; conversation: Conversation; profile: Profile }) => {
  const mine = message.from === "me";
  const time = (
    <time dateTime={message.sentAt} className="text-[11px] text-muted">
      {formatTime(message.sentAt)}
    </time>
  );

  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end gap-1.5">
          <span className="sr-only">{profile.displayName || "You"} (you):</span>
          {message.attachment && <AttachmentCard attachment={message.attachment} mine />}
          {message.text && (
            <p className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm shadow-primary/20">
              {message.text}
            </p>
          )}
          <span className="flex items-center gap-1 text-muted">
            {time}
            <CheckIcon className="w-3 h-3" />
            <span className="sr-only">Saved on this device</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 max-w-[90%] md:max-w-[75%]">
      <Avatar name={conversation.name} className="w-7 h-7 text-[10px] mt-1" />
      <div className="min-w-0 flex flex-col items-start gap-1.5">
        <span className="sr-only">{conversation.name}:</span>
        {message.text && (
          <p className="bg-surface-low border border-line/60 rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}
        {message.attachment && <AttachmentCard attachment={message.attachment} mine={false} />}
        {time}
      </div>
    </div>
  );
};

type ThreadProps = {
  conversation: Conversation;
  profile: Profile;
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: (message: Pick<ChatMessage, "text" | "attachment">) => void;
};

// Keyed by conversation id, so the info panel and pending attachment reset per thread
const Thread = ({ conversation: c, profile, draft, onDraftChange, onSend }: ThreadProps) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const firstName = c.name.split(" ")[0];
  const canSend = draft.trim().length > 0 || attachment !== null;

  // Keep the newest message in view on open and after sending
  const count = c.messages.length;
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [count]);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachError("");
    if (!file.type.startsWith("image/")) {
      setAttachError("Only images can be attached.");
      return;
    }
    try {
      // Downscaled data URL so the attachment survives a reload in local storage
      setAttachment({ src: await fileToAvatar(file, 720), name: file.name });
    } catch {
      setAttachError("That image couldn't be read. Try a different file.");
    }
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend({ text: draft.trim(), attachment: attachment ?? undefined });
    onDraftChange("");
    setAttachment(null);
    inputRef.current?.focus();
  };

  return (
    <section aria-label={`Conversation with ${c.name}`} className="flex flex-col min-h-0 h-full bg-white">
      <header className="shrink-0 flex items-center gap-3 h-16 px-3 md:px-5 border-b border-line">
        <Link to="/messages" aria-label="Back to messages" className={`${iconButton} md:hidden -ml-1`}>
          <ChevronLeftIcon />
        </Link>
        <Avatar name={c.name} className="w-10 h-10 text-sm" />
        <div className="flex-1 min-w-0">
          <h2 className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm font-bold truncate">{c.name}</span>
            <span className="text-xs text-muted truncate">@{c.handle}</span>
          </h2>
          <p className="text-xs text-muted truncate">
            {c.request ? "Message request · " : ""}
            {c.location}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          aria-expanded={infoOpen}
          aria-controls="conversation-info"
          aria-label={`About ${c.name}`}
          title="Conversation info"
          className={`${iconButton} ${infoOpen ? "bg-primary-soft text-primary" : ""}`}
        >
          <InfoIcon />
        </button>
      </header>

      {infoOpen && (
        <div id="conversation-info" className="shrink-0 px-5 py-3 border-b border-line bg-surface-low text-xs leading-relaxed">
          <p className="text-on-surface">{c.bio}</p>
          <p className="mt-1 text-muted">
            {c.topic} · Demo contact. Messages you send are saved in this browser only and aren't delivered to anyone.
          </p>
        </div>
      )}

      <div
        ref={logRef}
        role="log"
        aria-label={`Messages with ${c.name}`}
        tabIndex={0}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-5 space-y-6"
      >
        {c.messages.map((m, i) => (
          <Fragment key={m.id}>
            {(i === 0 || !sameDay(c.messages[i - 1].sentAt, m.sentAt)) && (
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-surface-high text-[10px] font-bold tracking-wider uppercase text-muted">
                  {formatDayLabel(m.sentAt)}
                </span>
              </div>
            )}
            <Message message={m} conversation={c} profile={profile} />
          </Fragment>
        ))}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-line px-3 md:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {attachment && (
          <div className="mb-2 inline-flex items-center gap-2 max-w-full pl-1 pr-2 py-1 rounded-xl bg-surface-low border border-line">
            <img src={attachment.src} alt="" className="w-9 h-9 rounded-lg object-cover" />
            <span className="text-xs font-medium truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label={`Remove ${attachment.name}`}
              className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-muted hover:bg-white hover:text-on-surface"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {attachError && (
          <p role="alert" className="mb-2 text-xs text-rose-700">
            {attachError}
          </p>
        )}
        <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-surface-low p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition">
          <button type="button" onClick={() => fileInput.current?.click()} aria-label="Attach an image" title="Attach an image" className={iconButton}>
            <PaperclipIcon />
          </button>
          <input ref={fileInput} type="file" accept="image/*" onChange={onFile} className="hidden" tabIndex={-1} aria-hidden />
          <label htmlFor="message-input" className="sr-only">
            Message {c.name}
          </label>
          <textarea
            ref={inputRef}
            id="message-input"
            rows={1}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds a line; don't interrupt IME composition
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Message ${firstName}…`}
            enterKeyHint="send"
            className="flex-1 min-w-0 self-center resize-none field-sizing-content max-h-32 bg-transparent py-2 text-sm placeholder:text-muted outline-none"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="h-10 shrink-0 px-3 sm:px-4 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-1.5 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SendIcon />
            <span className="sr-only sm:not-sr-only">Send</span>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted truncate">
          Demo conversation · saved in this browser only, not delivered
        </p>
      </form>
    </section>
  );
};

export default Thread;
