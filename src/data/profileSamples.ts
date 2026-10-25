// SAMPLE DATA: demonstration content for the profile page.
// None of this is the signed-in user's real activity; every entry is flagged
// `sample: true` and the UI labels it as such. Real posts the user publishes
// in this session are shown alongside it.

import type { PostImage } from "./posts";
import { posts } from "./posts";

type Base = {
  id: string;
  sample: true;
  date: string;
  tags: string[];
  likes: number;
  replies: number;
  reposts: number;
};

export type ArticleEntry = Base & {
  kind: "article";
  category: string;
  readTime: string;
  title: string;
  paragraphs: string[];
  quote: string;
  closing: string;
  images: PostImage[];
};

export type VisualEntry = Base & {
  kind: "visual";
  place: string;
  body: string;
  images: PostImage[];
  audio?: { title: string; meta: string; sources: { src: string; type: string }[] };
};

export type RepostEntry = Base & {
  kind: "repost";
  comment: string;
  original: { author: string; handle: string; role: string; time: string; body: string };
};

export type NoteEntry = Base & { kind: "note"; body: string };

export type ProfileEntry = ArticleEntry | VisualEntry | RepostEntry | NoteEntry;

const sophia = posts.find((p) => p.handle === "sophiachen")!;

export const sampleEntries: ProfileEntry[] = [
  {
    id: "sample-article",
    sample: true,
    kind: "article",
    category: "Tactile Monograph Essay",
    date: "Mar 24, 2026",
    readTime: "8 min read",
    title: "On Slow Software & Tactile Interfaces",
    paragraphs: [
      "We are surrounded by software that feels weightless: frictionless feeds, infinite scroll, interfaces engineered to vanish the moment we touch them. Yet the objects we cherish most — a well-bound book, a worn timber handle, a letter pressed into cotton paper — carry the marks of time and use.",
      "Slow software borrows from that tradition. It asks for a little patience in return for depth: deliberate transitions, honest materials, and screens that reward attention rather than harvest it.",
    ],
    quote:
      "Friction is not always a design flaw. In contemplative work, tactile friction is where memory, intention, and intimacy take root.",
    closing:
      "In the reflections that follow I look at how Japanese joinery, letterpress and analog photography can inform interfaces that feel considered rather than merely convenient.",
    images: [
      { src: "/images/kumiko.jpg", alt: "Kumiko lattice window casting patterned shadows", position: "50% 35%" },
      { src: "/images/engawa.jpg", alt: "Lantern-lit engawa with bamboo blinds", position: "50% 65%" },
    ],
    tags: ["SlowSoftware", "EditorialDesign", "TactileWeb"],
    likes: 342,
    replies: 28,
    reposts: 19,
  },
  {
    id: "sample-visual",
    sample: true,
    kind: "visual",
    date: "Feb 18, 2026",
    place: "Kyoto",
    body: "Morning studies of light on timber and paper. Rain on the veranda kept the whole house quiet, so I recorded thirty seconds of it to keep the mood.",
    images: [
      { src: "/images/courtyard.jpg", alt: "Stone path through a courtyard garden beside a timber house" },
      { src: "/images/engawa.jpg", alt: "Lantern-lit engawa corridor", position: "50% 55%" },
      { src: "/images/dining-room.jpg", alt: "Tatami hall with shoji windows", position: "80% 45%" },
    ],
    audio: {
      title: "Rain on a veranda",
      meta: "0:30 · public-domain field recording",
      sources: [
        { src: "/audio/rain-veranda.ogg", type: "audio/ogg" },
        { src: "/audio/rain-veranda.mp3", type: "audio/mpeg" },
      ],
    },
    tags: ["Architecture", "FieldRecording"],
    likes: 189,
    replies: 24,
    reposts: 11,
  },
  {
    id: "sample-repost",
    sample: true,
    kind: "repost",
    date: "Feb 2, 2026",
    comment: "Texture is a feature, not decoration. This is the argument I keep trying to make to clients.",
    original: {
      author: sophia.author,
      handle: sophia.handle,
      role: sophia.role,
      time: "Feb 1",
      body: sophia.body,
    },
    tags: ["TactileWeb"],
    likes: 112,
    replies: 16,
    reposts: 4,
  },
  {
    id: "sample-note-1",
    sample: true,
    kind: "note",
    date: "Jan 21, 2026",
    body: "Rewrote our studio's onboarding copy three times this week. Shorter every time, warmer every time.",
    tags: ["EditorialDesign"],
    likes: 64,
    replies: 7,
    reposts: 2,
  },
  {
    id: "sample-note-2",
    sample: true,
    kind: "note",
    date: "Jan 9, 2026",
    body: "Spent the afternoon re-binding an old type specimen. Bone folder, linen thread, and far more patience than I expected.",
    tags: ["Bookbinding", "Typography"],
    likes: 91,
    replies: 12,
    reposts: 5,
  },
];

export const sampleGalleries = [
  {
    id: "gallery-lattices",
    title: "Light through lattices",
    description: "Screens, shadows and the patterns they leave on walls.",
    images: [
      { src: "/images/kumiko.jpg", alt: "Kumiko lattice window", position: "50% 30%" },
      { src: "/images/engawa.jpg", alt: "Engawa with bamboo blinds", position: "50% 60%" },
      { src: "/images/dining-room.jpg", alt: "Shoji-lit tatami hall", position: "85% 40%" },
    ],
  },
  {
    id: "gallery-thresholds",
    title: "Courtyards & thresholds",
    description: "Where inside and outside negotiate.",
    images: [
      { src: "/images/courtyard.jpg", alt: "Courtyard garden path" },
      { src: "/images/engawa.jpg", alt: "Veranda corridor", position: "50% 40%" },
    ],
  },
];

export const sampleShelf = [
  { title: "In Praise of Shadows", author: "Jun'ichirō Tanizaki", tag: "Architecture & Light", status: "Re-reading" },
  { title: "The Shape of Design", author: "Frank Chimero", tag: "Design Practice", status: "Finished" },
  { title: "Designing Design", author: "Kenya Hara", tag: "Philosophy & Emptiness", status: "Up next" },
];

export const sampleEquipment = [
  "Fujifilm X100V",
  "Zoom H5 recorder",
  "Adana 8×5 letterpress",
  "Cedar drafting table",
  "Hasselblad 500C/M",
  "Mechanical keyboard",
];
