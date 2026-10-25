import { starterBookmarks, starterShelves, type Shelf } from "../data/bookmarkSamples";
import type { FeedPost } from "../data/posts";

const STORAGE_KEY = "circle:bookmarks:v1";

// savedAt doubles as the saved set: a post is bookmarked when it has an entry
export type BookmarkStore = { savedAt: Record<string, string>; shelves: Shelf[] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const starterStore = (): BookmarkStore => ({
  savedAt: Object.fromEntries(
    starterBookmarks.map((b) => [b.postId, new Date(Date.now() - b.daysAgo * 86_400_000).toISOString()]),
  ),
  shelves: starterShelves,
});

export const loadBookmarks = (): BookmarkStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Starter bookmarks only on a first visit; an empty saved list stays empty
    if (!raw) return starterStore();
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return starterStore();
    const savedAt: Record<string, string> = {};
    if (isRecord(data.savedAt)) {
      for (const [id, at] of Object.entries(data.savedAt)) {
        if (typeof at === "string" && !Number.isNaN(Date.parse(at))) savedAt[id] = at;
      }
    }
    const shelves = Array.isArray(data.shelves)
      ? data.shelves.flatMap((s): Shelf[] =>
          isRecord(s) && typeof s.id === "string" && typeof s.name === "string" && Array.isArray(s.itemIds)
            ? [{ id: s.id, name: s.name, itemIds: s.itemIds.filter((x): x is string => typeof x === "string") }]
            : [],
        )
      : [];
    return { savedAt, shelves };
  } catch {
    return starterStore();
  }
};

export const saveBookmarks = (store: BookmarkStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable (e.g. private mode); bookmarks still work for this visit
  }
};

export type BookmarkKind = "essays" | "visual" | "audio" | "code";

export const kindOf = (post: FeedPost): BookmarkKind => {
  if (!post.media) return "essays";
  if (post.media.type === "images") return "visual";
  return post.media.type;
};

export const kinds: { id: BookmarkKind | "all"; label: string; badge: string }[] = [
  { id: "all", label: "All Artefacts", badge: "" },
  { id: "essays", label: "Essays & Notes", badge: "Essay" },
  { id: "visual", label: "Visual & Architecture", badge: "Visual" },
  { id: "audio", label: "Audio & Soundscapes", badge: "Audio" },
  { id: "code", label: "Code & Snippets", badge: "Code" },
];

// Posts have no separate title, so the first sentence serves as one
export const splitTitle = (body: string) => {
  const match = body.match(/^(.{12,140}?[.!?])\s+([\s\S]*)$/);
  return match ? { title: match[1], excerpt: match[2] } : { title: body, excerpt: "" };
};

export const hashtag = (topic: string) => `#${topic.replace(/[^A-Za-z0-9]/g, "")}`;

export const citationFor = (post: FeedPost, now = new Date()) =>
  `${post.author} (@${post.handle}). “${splitTitle(post.body).title}” Circle. Accessed ${now.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.`;

export const savedLabel = (iso: string, now = Date.now()) => {
  const days = Math.floor((now - Date.parse(iso)) / 86_400_000);
  if (days < 1) return "Saved today";
  if (days === 1) return "Saved yesterday";
  if (days < 7) return `Saved ${days}d ago`;
  return `Saved ${new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" })}`;
};
