import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import BookmarkCard from "../components/bookmarks/BookmarkCard";
import BookmarksSidebar from "../components/bookmarks/BookmarksSidebar";
import { card } from "../components/home/styles";
import { BookmarkIcon, SearchIcon } from "../components/Icons";
import { useFeed } from "../layouts/feedContext";
import { hashtag, kindOf, kinds, splitTitle, type BookmarkKind } from "../lib/bookmarks";

const SORTS = [
  { id: "recent", label: "Recently saved" },
  { id: "oldest", label: "Oldest saved" },
  { id: "author", label: "Author A–Z" },
] as const;
type Sort = (typeof SORTS)[number]["id"];

const selectClass =
  "h-10 pl-3 pr-8 rounded-full border border-line bg-white text-xs font-semibold text-on-surface-variant hover:border-primary/40 focus:border-primary/50 outline-none";

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4" aria-hidden>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="w-4 h-4" aria-hidden>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

type Undo = { id: string; savedAt: string; title: string };

// Search, type, shelf, sort and view all live in the URL so refresh and Back/Forward keep them
const Bookmarks = () => {
  const { posts, saved, bookmarks, toggleSave, restoreBookmark, createShelf } = useFeed();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [undo, setUndo] = useState<Undo | null>(null);

  const q = params.get("q") ?? "";
  const kindParam = params.get("type");
  const kind = kinds.some((k) => k.id === kindParam) ? (kindParam as BookmarkKind) : "all";
  const shelfParam = params.get("shelf");
  const shelf = bookmarks.shelves.find((s) => s.id === shelfParam) ?? null;
  const sortParam = params.get("sort");
  const sort: Sort = SORTS.some((s) => s.id === sortParam) ? (sortParam as Sort) : "recent";
  const view = params.get("view") === "grid" ? "grid" : "list";

  const href = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    return s ? `/bookmarks?${s}` : "/bookmarks";
  };

  const savedPosts = posts.filter((p) => saved.has(p.id));
  const shelvesOf = (id: string) => bookmarks.shelves.filter((s) => s.itemIds.includes(id)).map((s) => s.name);
  const needle = q.trim().toLowerCase();
  const matches = (p: (typeof posts)[number]) =>
    !needle ||
    [splitTitle(p.body).title, p.body, p.author, p.handle, p.role, ...p.topics, ...p.topics.map(hashtag), ...shelvesOf(p.id)].some((s) =>
      s.toLowerCase().includes(needle),
    );

  // Type counts reflect the current shelf and search, so each pill shows what selecting it would list
  const faceted = savedPosts.filter((p) => (!shelf || shelf.itemIds.includes(p.id)) && matches(p));
  const countOf = (id: BookmarkKind | "all") => (id === "all" ? faceted.length : faceted.filter((p) => kindOf(p) === id).length);
  const at = (id: string) => Date.parse(bookmarks.savedAt[id]);
  const visible = faceted
    .filter((p) => kind === "all" || kindOf(p) === kind)
    .sort((a, b) =>
      sort === "author" ? a.author.localeCompare(b.author) : sort === "oldest" ? at(a.id) - at(b.id) : at(b.id) - at(a.id),
    );

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(timer);
  }, [undo]);

  const remove = (id: string, title: string) => {
    setUndo({ id, savedAt: bookmarks.savedAt[id], title });
    toggleSave(id);
  };

  const exportArchive = () => {
    const archive = {
      format: "circle-bookmarks",
      version: 1,
      exportedAt: new Date().toISOString(),
      items: savedPosts.map((p) => ({
        id: p.id,
        savedAt: bookmarks.savedAt[p.id],
        author: p.author,
        handle: p.handle,
        role: p.role,
        text: p.body,
        topics: p.topics,
        media: p.media ?? null,
        shelves: shelvesOf(p.id),
      })),
      shelves: bookmarks.shelves.map((s) => ({ id: s.id, name: s.name, itemIds: s.itemIds.filter((id) => saved.has(id)) })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `circle-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let empty: { title: string; body: string; action?: { to: string; label: string } } | null = null;
  if (savedPosts.length === 0) {
    empty = {
      title: "Nothing saved yet",
      body: "Tap the bookmark on any post in your feed or profile to keep it here.",
      action: { to: "/home", label: "Browse your feed" },
    };
  } else if (shelf && !savedPosts.some((p) => shelf.itemIds.includes(p.id))) {
    empty = { title: `“${shelf.name}” is empty`, body: "No saved items are on this shelf yet.", action: { to: href({ shelf: null }), label: "Show all shelves" } };
  } else if (visible.length === 0 && needle) {
    empty = { title: "No matches", body: `No saved items match “${q.trim()}”.`, action: { to: href({ q: null }), label: "Clear search" } };
  } else if (visible.length === 0) {
    empty = { title: "Nothing here", body: "No saved items of this type in the current view.", action: { to: href({ type: null }), label: "Show all types" } };
  }

  return (
    <div className="pt-4 md:pt-7 pb-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Archived index · Personal library</p>
          <h1 className="mt-1 font-serif text-[32px] md:text-[40px] font-semibold leading-tight">Saved Artefacts &amp; Bookmarks</h1>
          <p className="mt-1.5 max-w-xl text-sm text-on-surface-variant">
            A private compendium of monographs, field recordings, acoustic spaces and tactile inspirations.
          </p>
        </div>
        <p className="shrink-0 text-xs text-muted">
          <strong className="text-on-surface">{savedPosts.length}</strong> saved {savedPosts.length === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="bookmark-search" className="sr-only">
            Search saved items
          </label>
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            id="bookmark-search"
            type="search"
            value={q}
            onChange={(e) => {
              // Replace rather than push so each keystroke doesn't become a history entry
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("q", e.target.value);
              else next.delete("q");
              setParams(next, { replace: true });
            }}
            placeholder="Search titles, authors, notes or tags"
            className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm placeholder:text-muted focus:border-primary/50 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="bookmark-shelf">
            Filter by shelf
          </label>
          <select id="bookmark-shelf" value={shelf?.id ?? ""} onChange={(e) => navigate(href({ shelf: e.target.value || null }))} className={selectClass}>
            <option value="">All shelves</option>
            {bookmarks.shelves.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="bookmark-sort">
            Sort saved items
          </label>
          <select id="bookmark-sort" value={sort} onChange={(e) => navigate(href({ sort: e.target.value === "recent" ? null : e.target.value }))} className={selectClass}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <div role="group" aria-label="Layout" className="flex rounded-full border border-line bg-white p-0.5">
            {(["list", "grid"] as const).map((v) => (
              <Link
                key={v}
                to={href({ view: v === "list" ? null : v })}
                aria-label={v === "list" ? "List view" : "Grid view"}
                aria-current={view === v ? "true" : undefined}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                  view === v ? "bg-primary text-white" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {v === "list" ? <ListIcon /> : <GridIcon />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <nav aria-label="Filter by type" className="mt-4 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        <ul className="flex gap-2 w-max pb-1">
          {kinds.map((k) => {
            const active = k.id === kind;
            return (
              <li key={k.id}>
                <Link
                  to={href({ type: k.id === "all" ? null : k.id })}
                  aria-current={active ? "true" : undefined}
                  className={`relative h-9 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border whitespace-nowrap transition ${
                    active
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-line text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                  }`}
                >
                  {k.label}
                  <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-[18px] text-center ${active ? "bg-white/25" : "bg-surface-high"}`}>
                    {countOf(k.id)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_16.5rem] xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <section aria-label="Saved items" className="min-w-0">
          {(shelf || needle) && (
            <p role="status" className="mb-3 text-xs text-muted">
              Showing {visible.length} {visible.length === 1 ? "item" : "items"}
              {shelf && <> on <strong className="text-on-surface">{shelf.name}</strong></>}
              {needle && <> matching “{q.trim()}”</>}
            </p>
          )}
          {empty ? (
            <div className={`${card} p-8 text-center`}>
              <span className="mx-auto w-11 h-11 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                <BookmarkIcon className="w-5 h-5" />
              </span>
              <h2 className="mt-3 font-serif text-xl font-semibold">{empty.title}</h2>
              <p className="mt-1 text-sm text-muted">{empty.body}</p>
              {empty.action && (
                <Link to={empty.action.to} className="mt-4 inline-flex h-9 px-4 rounded-full bg-primary text-white text-xs font-bold items-center">
                  {empty.action.label}
                </Link>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${view === "grid" ? "sm:grid-cols-2" : ""}`}>
              {visible.map((p) => (
                <BookmarkCard
                  key={p.id}
                  post={p}
                  savedAt={bookmarks.savedAt[p.id]}
                  shelves={shelvesOf(p.id)}
                  compact={view === "grid"}
                  onRemove={() => remove(p.id, splitTitle(p.body).title)}
                />
              ))}
            </div>
          )}
        </section>

        <BookmarksSidebar
          shelves={bookmarks.shelves}
          savedPosts={savedPosts}
          activeShelf={shelf?.id ?? null}
          shelfHref={(id) => href({ shelf: id })}
          onCreateShelf={(name, ids) => navigate(href({ shelf: createShelf(name, ids) }))}
          onExport={exportArchive}
        />
      </div>

      <div aria-live="polite" className="fixed inset-x-0 bottom-20 md:bottom-6 z-40 flex justify-center px-4 pointer-events-none">
        {undo && (
          <div className="pointer-events-auto max-w-md w-full sm:w-auto flex items-center gap-3 rounded-full bg-on-surface text-white pl-4 pr-1.5 py-1.5 shadow-lg">
            <p className="flex-1 min-w-0 text-xs truncate">Removed “{undo.title}”</p>
            <button
              type="button"
              onClick={() => {
                restoreBookmark(undo.id, undo.savedAt);
                setUndo(null);
              }}
              className="h-9 px-4 rounded-full bg-white/15 text-xs font-bold hover:bg-white/25"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
