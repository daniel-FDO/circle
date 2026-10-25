export type PostImage = { src: string; alt: string; position?: string };

export type PostMedia =
  | { type: "images"; images: PostImage[] }
  | { type: "code"; filename: string; code: string }
  | { type: "audio"; title: string; duration: string };

export type FeedPost = {
  id: string;
  author: string;
  handle: string;
  avatar?: string | null;
  role: string;
  minutesAgo: number;
  topics: string[];
  badge?: string;
  body: string;
  media?: PostMedia;
  likes: number;
  replies: number;
  reposts: number;
  audience?: string;
  mine?: boolean;
};

export const posts: FeedPost[] = [
  {
    id: "p1",
    author: "Marcus Vance",
    handle: "marcusvance",
    role: "Design Director & Typographer",
    minutesAgo: 120,
    topics: ["Architecture"],
    body: "Finished documenting the renovated timber pavilion in Kyoto. The way morning light cuts through the cedar louvers changes every twelve minutes. Full case study going live this week.",
    media: {
      type: "images",
      images: [
        { src: "/images/engawa.jpg", alt: "Lantern-lit engawa corridor with bamboo blinds and timber screens", position: "50% 60%" },
        { src: "/images/kumiko.jpg", alt: "Kumiko lattice window casting patterned shadows on a wall", position: "50% 30%" },
        { src: "/images/dining-room.jpg", alt: "Tatami hall with shoji windows and low lacquered tables", position: "80% 40%" },
      ],
    },
    likes: 148,
    replies: 24,
    reposts: 12,
  },
  {
    id: "p2",
    author: "Sophia Chen",
    handle: "sophiachen",
    role: "Creative Technologist · Tokyo",
    minutesAgo: 300,
    topics: ["Tactile Web", "Interaction Design"],
    badge: "Curator pick",
    body: "Unpopular opinion: The best UI isn't invisible, it has character. Subtle physical friction, tactile button states, and editorial typography make software feel like a place you actually want to spend time in.",
    media: {
      type: "code",
      filename: "tactile-button.css",
      code: `.atelier-surface {
  background: url('paper-warm.png');
  box-shadow: 0 1px 0 rgba(30, 27, 25, 0.04),
              0 6px 14px -8px rgba(30, 27, 25, 0.35);
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.atelier-surface:active {
  transform: translateY(1px) scale(0.99);
}`,
    },
    likes: 382,
    replies: 89,
    reposts: 41,
  },
  {
    id: "p3",
    author: "David Koh",
    handle: "davidkoh",
    role: "Sound Designer & Field Recordist",
    minutesAgo: 480,
    topics: ["Soundscapes", "Field Recording"],
    body: "Early morning recording in Big Sur after three days of relentless drizzle. Captured the low roar of the Pacific against sea caves layered with pine needle drips. Best with headphones.",
    media: { type: "audio", title: "Pacific Coast Highway Rain Ambience", duration: "12:34" },
    likes: 96,
    replies: 18,
    reposts: 9,
  },
  {
    id: "p4",
    author: "Renée Dubois",
    handle: "reneedubois",
    role: "Typefoundry & tactile publications",
    minutesAgo: 900,
    topics: ["Typography", "Editorial Design"],
    body: "Proofing the italic for our new text face tonight. Low contrast, generous apertures, built for reading by lamplight. Specimen PDF goes out to subscribers on Friday.",
    likes: 211,
    replies: 32,
    reposts: 17,
  },
  {
    id: "p5",
    author: "Ines Duarte",
    handle: "inesduarte",
    role: "Landscape & Analog Photography",
    minutesAgo: 1500,
    topics: ["Analog Photography", "Landscape Design"],
    body: "A grey morning in the Shoin House courtyard. The hostas and the stepping stones do all the composing; I just stood still long enough. Scanning the rest of the roll this weekend.",
    media: {
      type: "images",
      images: [{ src: "/images/courtyard.jpg", alt: "Stone path through a Japanese courtyard garden beside a timber house" }],
    },
    likes: 174,
    replies: 11,
    reposts: 14,
  },
  {
    id: "p6",
    author: "Maya Ito Studio",
    handle: "mayaitostudio",
    role: "Stoneware & glaze research",
    minutesAgo: 1800,
    topics: ["Ceramics & Craft"],
    body: "Ash glaze tests, batch 14: twelve tiles, three firings, one happy accident. The wood-ash ratio that broke into blue at cone 10 is now our studio default.",
    likes: 129,
    replies: 21,
    reposts: 6,
  },
  {
    id: "p7",
    author: "Theo Marsh",
    handle: "theomarsh",
    role: "Builds slow software",
    minutesAgo: 2700,
    topics: ["Local-first Software"],
    body: "Your notes should outlive the app. Our sync layer is now plain files plus an append-only log. Works offline, merges without a server, and you can read it with a text editor.",
    media: {
      type: "code",
      filename: "sync.ts",
      code: `export async function sync(local: Log, remote: Log) {
  const missing = remote.since(local.head);
  for (const op of missing) local.append(op);
  await local.flushToDisk();
}`,
    },
    likes: 264,
    replies: 47,
    reposts: 38,
  },
  {
    id: "p8",
    author: "Julian Thorne",
    handle: "julianthorne",
    role: "Generative artist",
    minutesAgo: 3100,
    topics: ["Generative Art", "Creative Coding"],
    body: "Added deliberate tremor to the pen-plotter paths this week. Half a millimetre of noise and the drawings finally stopped looking like a machine made them.",
    likes: 88,
    replies: 9,
    reposts: 5,
  },
  {
    id: "p9",
    author: "Amara Okafor",
    handle: "amaraokafor",
    role: "Editor, Quarterly Press",
    minutesAgo: 4300,
    topics: ["Editorial Design"],
    body: "Issue 6 is at the printer. Two columns, hanging captions, and far more white space than our accountant would like.",
    likes: 157,
    replies: 14,
    reposts: 10,
  },
];
