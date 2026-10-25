export type Profile = {
  avatar: string | null;
  displayName: string;
  handle: string;
  bio: string;
  pronouns: string;
  location: string;
  website: string;
};

export type Curation = {
  topics: string[];
  following: string[];
};

export type Voice = {
  name: string;
  handle: string;
  tag: string | null;
  tagClass: string;
  about: string;
};

export const voices: Voice[] = [
  {
    name: "Marcus Vance",
    handle: "marcusvance",
    tag: "Essayist",
    tagClass: "bg-amber-100 text-amber-800",
    about: "Architecture & Spatial essays",
  },
  {
    name: "Sophia Chen",
    handle: "sophiachen",
    tag: "Maker",
    tagClass: "bg-primary-soft text-primary",
    about: "Stoneware, glaze chemist",
  },
  {
    name: "Renée Dubois",
    handle: "reneedubois",
    tag: null,
    tagClass: "",
    about: "Typefoundry & tactile publications",
  },
];
