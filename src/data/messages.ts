// Demo conversations. There's no messaging backend yet, so these are sample contacts and
// anything the user sends is only saved in this browser (see lib/messages.ts).

export type MessageAttachment = {
  src: string;
  name: string;
  title?: string;
  details?: string;
};

export type ChatMessage = {
  id: string;
  from: "them" | "me";
  text: string;
  sentAt: string;
  attachment?: MessageAttachment;
};

export type Conversation = {
  id: string;
  name: string;
  handle: string;
  topic: string;
  location: string;
  bio: string;
  request?: boolean;
  unread: boolean;
  messages: ChatMessage[];
};

// Seed timestamps are relative to page load so "Today" and "Yesterday" stay meaningful
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const DAY = 24 * 60;

export const demoConversations: Conversation[] = [
  {
    id: "julian-thorne",
    name: "Julian Thorne",
    handle: "julianthorne",
    topic: "Generative UI / Shaders",
    location: "San Francisco, CA",
    bio: "Generative artist building type systems out of fragment shaders.",
    unread: true,
    messages: [
      {
        id: "jt1",
        from: "them",
        text: "Elena, I spent yesterday evening deconstructing your thesis on procedural typography layouts. The tension between strict editorial grids and loose organic margins is extraordinary.",
        sentAt: ago(34),
      },
      {
        id: "jt2",
        from: "them",
        text: "",
        sentAt: ago(32),
        attachment: {
          src: "/images/kumiko.jpg",
          name: "specimen-layout-04.jpg",
          title: "Specimen Layout #04 — Kinetic Stems",
          details: "Lattice study · JPEG",
        },
      },
      {
        id: "jt3",
        from: "me",
        text: "This balance of procedural texture with editorial grid is wonderful. The micro-cadence of those margins feels completely alive! Are you rendering this via native canvas or running custom SVG fragment shaders?",
        sentAt: ago(30),
      },
      {
        id: "jt4",
        from: "them",
        text: "I loved the typography question. Native canvas for the stems, with a fragment pass on top for the grain. Happy to share the setup.",
        sentAt: ago(28),
      },
    ],
  },
  {
    id: "renee-dubois",
    name: "Renée Dubois",
    handle: "reneedubois",
    topic: "Analog Typography",
    location: "Lyon, FR",
    bio: "Typefoundry & tactile publications.",
    unread: false,
    messages: [
      {
        id: "rd1",
        from: "me",
        text: "The lamplight specimen proofs arrived. The ink spread on the cotton stock is beautiful.",
        sentAt: ago(DAY + 180),
      },
      {
        id: "rd2",
        from: "them",
        text: "Let's definitely sync on the next proof before it goes to press. I want to tighten the italic.",
        sentAt: ago(DAY + 90),
      },
    ],
  },
  {
    id: "maya-ito-studio",
    name: "Maya Ito Studio",
    handle: "mayaitostudio",
    topic: "Ceramic Craft",
    location: "Kyoto, JP",
    bio: "Wood-fired stoneware and slow glaze experiments.",
    unread: true,
    messages: [
      {
        id: "mi1",
        from: "them",
        text: "The courtyard where we fire the kiln, as promised.",
        sentAt: ago(2 * DAY + 60),
      },
      {
        id: "mi2",
        from: "them",
        text: "",
        sentAt: ago(2 * DAY + 58),
        attachment: {
          src: "/images/courtyard.jpg",
          name: "kiln-courtyard.jpg",
          title: "Kiln courtyard, early morning",
          details: "Studio photo · JPEG",
        },
      },
    ],
  },
  {
    id: "david-kim",
    name: "David Kim",
    handle: "davidkim",
    topic: "Field Recording",
    location: "Portland, OR",
    bio: "Sound recordist collecting coastlines and rooms.",
    unread: false,
    messages: [
      {
        id: "dk1",
        from: "them",
        text: "The Pacific coast field recordings are up. The tide pool one is my favourite.",
        sentAt: ago(9 * DAY),
      },
      {
        id: "dk2",
        from: "me",
        text: "Listening tonight. Thank you for sending them over!",
        sentAt: ago(9 * DAY - 20),
      },
    ],
  },
  {
    id: "ines-alvarez",
    name: "Inés Alvarez",
    handle: "inesalvarez",
    topic: "Editorial Design",
    location: "Madrid, ES",
    bio: "Art director at a small quarterly about craft.",
    request: true,
    unread: true,
    messages: [
      {
        id: "ia1",
        from: "them",
        text: "Hi Elena, I edit a small quarterly on craft. Would you be open to contributing a short essay on editorial grids?",
        sentAt: ago(190),
      },
    ],
  },
];
