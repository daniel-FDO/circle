import type { Curation, Profile } from "../types";

const STORAGE_KEY = "circle:session:v1";

export type Session = {
  profile: Profile;
  curation: Curation | null;
  onboarded: boolean;
  // ISO date set when onboarding is completed; null for older saved sessions
  joinedAt: string | null;
};

export const defaultProfile: Profile = {
  avatar: null,
  displayName: "Elena Rostova",
  handle: "elenarostova",
  bio: "Creative director & multidisciplinary designer exploring tactile editorial design, organic architecture, and slow digital tools.",
  pronouns: "she/her",
  location: "Copenhagen, DK",
  website: "elenarostova.studio",
};

const defaultSession: Session = { profile: defaultProfile, curation: null, onboarded: false, joinedAt: null };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);

const strings = (v: unknown) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string"))] : null;

const parseProfile = (v: unknown): Profile => {
  if (!isRecord(v)) return defaultProfile;
  // Only data URLs survive a reload; blob: URLs from an old session are dead
  const avatar = typeof v.avatar === "string" && v.avatar.startsWith("data:image/") ? v.avatar : null;
  return {
    avatar,
    displayName: str(v.displayName, defaultProfile.displayName),
    handle: str(v.handle, defaultProfile.handle),
    bio: str(v.bio, defaultProfile.bio),
    pronouns: str(v.pronouns, defaultProfile.pronouns),
    location: str(v.location, defaultProfile.location),
    website: str(v.website, defaultProfile.website),
  };
};

const parseCuration = (v: unknown): Curation | null => {
  if (!isRecord(v)) return null;
  const topics = strings(v.topics);
  const following = strings(v.following);
  return topics && following ? { topics, following } : null;
};

export const loadSession = (): Session => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSession;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return defaultSession;
    const curation = parseCuration(data.curation);
    return {
      profile: parseProfile(data.profile),
      curation,
      // Can't be onboarded without a valid curation to build the feed from
      onboarded: data.onboarded === true && curation !== null,
      joinedAt:
        typeof data.joinedAt === "string" && !Number.isNaN(Date.parse(data.joinedAt)) ? data.joinedAt : null,
    };
  } catch {
    return defaultSession;
  }
};

export const saveSession = (session: Session) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage full or blocked: retry without the avatar, the largest field
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...session, profile: { ...session.profile, avatar: null } }),
      );
    } catch {
      // Storage unavailable (e.g. private mode); the app still works for this visit
    }
  }
};
