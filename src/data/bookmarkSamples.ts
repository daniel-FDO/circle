// SAMPLE DATA: starter bookmarks and shelves used only the first time someone opens Circle
// in this browser. After that the user's own saved state (lib/bookmarks.ts) is the only
// source, so anything they remove stays removed.

export type Shelf = { id: string; name: string; itemIds: string[] };

export type StarterBookmark = { postId: string; daysAgo: number };

export const starterBookmarks: StarterBookmark[] = [
  { postId: "p1", daysAgo: 1 },
  { postId: "p3", daysAgo: 2 },
  { postId: "p2", daysAgo: 4 },
  { postId: "p5", daysAgo: 6 },
];

export const starterShelves: Shelf[] = [
  { id: "shelf-kyoto", name: "Kyoto Architecture", itemIds: ["p1", "p5"] },
  { id: "shelf-tactile", name: "Tactile Web & Shaders", itemIds: ["p2"] },
  { id: "shelf-ambience", name: "Studio Ambience", itemIds: ["p3"] },
];

// Sample studio notes shown on a few starter bookmarks, labelled as samples in the UI
export const sampleNotes: Record<string, string> = {
  p1: "Check how the louvers' twelve-minute light shift could inform the pacing of our gallery transitions.",
};
