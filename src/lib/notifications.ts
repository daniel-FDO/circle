import { sampleNotifications, type AppNotification, type NotificationCategory, type Salon } from "../data/notifications";
import type { Curation } from "../types";

const STORAGE_KEY = "circle:notifications:v1";

export type Rsvp = "going" | "declined";
export type NotificationReply = { id: string; text: string; at: string };

// Only the user's own interactions are stored; the sample notifications are rebuilt on load
export type NotificationStore = {
  read: string[];
  rsvp: Record<string, Rsvp>;
  replies: Record<string, NotificationReply[]>;
  quietDigest: boolean;
};

const emptyStore: NotificationStore = { read: [], rsvp: {}, replies: {}, quietDigest: false };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const loadNotifications = (): NotificationStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return emptyStore;
    const read = Array.isArray(data.read) ? data.read.filter((x): x is string => typeof x === "string") : [];
    const rsvp: NotificationStore["rsvp"] = {};
    if (isRecord(data.rsvp)) {
      for (const [id, v] of Object.entries(data.rsvp)) if (v === "going" || v === "declined") rsvp[id] = v;
    }
    const replies: NotificationStore["replies"] = {};
    if (isRecord(data.replies)) {
      for (const [id, list] of Object.entries(data.replies)) {
        if (!Array.isArray(list)) continue;
        replies[id] = list.filter(
          (r): r is NotificationReply =>
            isRecord(r) && typeof r.id === "string" && typeof r.text === "string" && typeof r.at === "string",
        );
      }
    }
    return { read, rsvp, replies, quietDigest: data.quietDigest === true };
  } catch {
    return emptyStore;
  }
};

export const saveNotifications = (store: NotificationStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable (e.g. private mode); the page still works for this visit
  }
};

export type FeedNotification = AppNotification & { unread: boolean };

// Sample notifications plus a real one about the user's own setup, newest first
export const buildNotifications = (
  store: NotificationStore,
  curation: Curation,
  joinedAt: string | null,
): FeedNotification[] => {
  const all: AppNotification[] = [...sampleNotifications];
  if (joinedAt) {
    all.push({
      id: "n-system-welcome",
      kind: "system",
      category: "system",
      at: joinedAt,
      following: curation.following.length,
      topics: curation.topics.length,
    });
  }
  return all
    .map((n) => ({ ...n, unread: !store.read.includes(n.id) }))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
};

export const categories: { id: NotificationCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions & Replies" },
  { id: "sparks", label: "Curator Sparks" },
  { id: "salons", label: "Salon Invites" },
  { id: "system", label: "System & Archives" },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// "Today", "Earlier this week" (since Monday), or "Earlier"
export const groupLabel = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  const today = startOfDay(now);
  if (date >= today) return "Today";
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return date >= monday ? "Earlier this week" : "Earlier";
};

export const relativeTime = (iso: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
};

export const salonDay = (salon: Salon) => {
  const d = new Date(salon.start);
  return {
    weekday: d.toLocaleDateString([], { weekday: "short" }),
    month: d.toLocaleDateString([], { month: "short" }),
    day: d.getDate(),
  };
};

// "18:00 – 19:45 CET" in the viewer's own time zone
export const salonTime = (salon: Salon) => {
  const start = new Date(salon.start);
  const end = new Date(start.getTime() + salon.minutes * 60_000);
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const zone =
    new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(start).find((p) => p.type === "timeZoneName")
      ?.value ?? "";
  return `${start.toLocaleTimeString([], opts)} – ${end.toLocaleTimeString([], opts)} ${zone}`.trim();
};
