import { demoConversations, type ChatMessage, type Conversation } from "../data/messages";

const STORAGE_KEY = "circle:messages:v1";

// Only what the user did is stored; demo conversations are merged back in on load
export type MessageStore = {
  sent: Record<string, ChatMessage[]>;
  read: string[];
};

const emptyStore: MessageStore = { sent: {}, read: [] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const parseMessage = (v: unknown): ChatMessage | null => {
  if (!isRecord(v) || typeof v.id !== "string" || typeof v.text !== "string") return null;
  if (typeof v.sentAt !== "string" || Number.isNaN(Date.parse(v.sentAt))) return null;
  const a = v.attachment;
  // Only data URLs survive a reload
  const attachment =
    isRecord(a) && typeof a.src === "string" && a.src.startsWith("data:image/") && typeof a.name === "string"
      ? { src: a.src, name: a.name }
      : undefined;
  if (!v.text.trim() && !attachment) return null;
  return { id: v.id, from: "me", text: v.text, sentAt: v.sentAt, attachment };
};

export const loadMessages = (): MessageStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return emptyStore;
    const sent: MessageStore["sent"] = {};
    if (isRecord(data.sent)) {
      for (const [id, list] of Object.entries(data.sent)) {
        if (Array.isArray(list)) sent[id] = list.map(parseMessage).filter((m): m is ChatMessage => m !== null);
      }
    }
    const read = Array.isArray(data.read) ? data.read.filter((x): x is string => typeof x === "string") : [];
    return { sent, read };
  } catch {
    return emptyStore;
  }
};

export const saveMessages = (store: MessageStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or blocked: keep the text and drop image attachments, the largest part
    try {
      const sent = Object.fromEntries(
        Object.entries(store.sent).map(([id, list]) => [
          id,
          list.map((m) => ({ ...m, attachment: undefined })).filter((m) => m.text.trim()),
        ]),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, sent }));
    } catch {
      // Storage unavailable (e.g. private mode); messages still work for this visit
    }
  }
};

export const buildConversations = (store: MessageStore): Conversation[] =>
  demoConversations
    .map((c) => ({
      ...c,
      unread: c.unread && !store.read.includes(c.id),
      messages: [...c.messages, ...(store.sent[c.id] ?? [])],
    }))
    .sort((a, b) => Date.parse(lastMessage(b).sentAt) - Date.parse(lastMessage(a).sentAt));

export const lastMessage = (c: Conversation) => c.messages[c.messages.length - 1];

export const previewOf = (message: ChatMessage) => {
  const text = message.text.trim() || (message.from === "me" ? "Sent an image" : "Sent an image attachment");
  return message.from === "me" ? `You: ${text}` : text;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b) - startOfDay(a)) / 86_400_000);

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// List timestamps: "10:14 AM", "Yesterday", "2d ago", "May 12"
export const formatListTime = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  const days = daysBetween(date, now);
  if (days <= 0) return formatTime(iso);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Thread separators: "Today, May 18", "Yesterday, May 17", "Tue, May 12"
export const formatDayLabel = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  const days = daysBetween(date, now);
  const short = date.toLocaleDateString([], { month: "short", day: "numeric" });
  if (days <= 0) return `Today, ${short}`;
  if (days === 1) return `Yesterday, ${short}`;
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

export const sameDay = (a: string, b: string) => startOfDay(new Date(a)) === startOfDay(new Date(b));
