// SAMPLE DATA: demo notifications. There's no notification server, so these are fixed examples
// about the sample essay and recording on the profile page. Read state, RSVPs and replies are
// saved in this browser only (see lib/notifications.ts); nothing is delivered to anyone.

import { sampleEntries, type ArticleEntry, type VisualEntry } from "./profileSamples";

export type NotificationCategory = "mentions" | "sparks" | "salons" | "system";

export type Person = { name: string; handle: string; role?: string };

// A destination that exists in the app
export type ContentLink = { title: string; to: string };

type Base = { id: string; category: NotificationCategory; at: string };

export type AppNotification =
  | (Base & {
      kind: "reply";
      actor: Person;
      target: ContentLink;
      quote: string;
      resource: ContentLink & { meta: string };
    })
  | (Base & { kind: "invite"; actors: Person[]; salonId: string; message: string })
  | (Base & {
      kind: "reactions";
      actors: Person[];
      others: number;
      target: ContentLink;
      sparks: number;
      archives: number;
      audio?: VisualEntry["audio"];
    })
  | (Base & {
      kind: "follow";
      actor: Person;
      preview: { title: string; meta: string; image: string };
      conversationId: string;
      welcome: string;
    })
  | (Base & { kind: "citation"; actor: Person; journal: string; target: ContentLink; quote: string })
  | (Base & { kind: "archive"; actor: Person; list: string; target: ContentLink })
  | (Base & { kind: "system"; following: number; topics: number });

export type Salon = {
  id: string;
  title: string;
  start: string;
  minutes: number;
  location: string;
  capacity: string;
};

// Timestamps are relative to page load so "Today" and "Earlier this week" stay meaningful
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const inDays = (days: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const essay = sampleEntries.find((e): e is ArticleEntry => e.kind === "article")!;
const recording = sampleEntries.find((e): e is VisualEntry => e.kind === "visual" && !!e.audio)!;

const essayLink: ContentLink = { title: essay.title, to: "/profile?tab=collections" };
const recordingLink: ContentLink = { title: recording.audio!.title, to: "/profile?tab=visual" };

export const salons: Salon[] = [
  {
    id: "salon-tactile-web",
    title: "Tactile Web & Slow Tools",
    start: inDays(3, 18),
    minutes: 105,
    location: "Acoustic Audio Stage",
    capacity: "8 curators max",
  },
  {
    id: "salon-local-first",
    title: "Local-first Architecture Circle",
    start: inDays(6, 19),
    minutes: 90,
    location: "Reading Room",
    capacity: "12 curators max",
  },
];

export const sampleNotifications: AppNotification[] = [
  {
    id: "n-sophia-reply",
    kind: "reply",
    category: "mentions",
    at: ago(28),
    actor: { name: "Sophia Chen", handle: "sophiachen", role: "Creative Technologist" },
    target: essayLink,
    quote:
      "The micro-friction you describe is exactly what I keep trying to prototype. Tactile button states feel less like decoration and more like a promise that the software is listening.",
    resource: { ...essayLink, meta: `${essay.category} · ${essay.readTime}` },
  },
  {
    id: "n-salon-invite",
    kind: "invite",
    category: "salons",
    at: ago(120),
    actors: [
      { name: "Marcus Vance", handle: "marcusvance" },
      { name: "Julian Thorne", handle: "julianthorne" },
    ],
    salonId: "salon-tactile-web",
    message:
      "Elena, your essay on slow software feels like the missing pillar for this discussion. Would you be up for co-hosting?",
  },
  {
    id: "n-recording-sparks",
    kind: "reactions",
    category: "sparks",
    at: ago(240),
    actors: [
      { name: "Renée Dubois", handle: "reneedubois" },
      { name: "David Koh", handle: "davidkoh" },
      { name: "Maya Ito Studio", handle: "mayaitostudio" },
    ],
    others: 14,
    target: recordingLink,
    sparks: 16,
    archives: 9,
    audio: recording.audio,
  },
  {
    id: "n-ines-follow",
    kind: "follow",
    category: "sparks",
    at: ago(2 * 24 * 60),
    actor: { name: "Inés Alvarez", handle: "inesalvarez", role: "Art Director" },
    preview: { title: "Quarterly spreads archive", meta: "24 editorial layouts documented", image: "/images/dining-room.jpg" },
    conversationId: "ines-alvarez",
    welcome: "Welcome to my circle, Inés! Thanks for the follow. I'd be glad to hear more about the quarterly.",
  },
  {
    id: "n-renee-archive",
    kind: "archive",
    category: "system",
    at: ago(2 * 24 * 60 + 300),
    actor: { name: "Renée Dubois", handle: "reneedubois", role: "Typefoundry" },
    list: "Lamplight Type",
    target: essayLink,
  },
  {
    id: "n-kenzo-citation",
    kind: "citation",
    category: "mentions",
    at: ago(3 * 24 * 60),
    actor: { name: "Kenzo Lindqvist", handle: "kenzoql", role: "Acoustic Architect" },
    journal: "Acoustic Shadows and Cast Concrete",
    target: essayLink,
    quote: essay.quote,
  },
  {
    id: "n-salon-local-first",
    kind: "invite",
    category: "salons",
    at: ago(4 * 24 * 60),
    actors: [{ name: "Theo Marsh", handle: "theomarsh" }],
    salonId: "salon-local-first",
    message: "A small circle on sync, plain files and software that outlives its servers. Your notes would fit right in.",
  },
];
