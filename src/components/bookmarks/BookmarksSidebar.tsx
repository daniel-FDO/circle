import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { card } from "../home/styles";
import { DownloadIcon, LinkIcon, LockIcon, PlusIcon } from "../Icons";
import type { Shelf } from "../../data/bookmarkSamples";
import type { FeedPost } from "../../data/posts";
import { splitTitle } from "../../lib/bookmarks";

type BookmarksSidebarProps = {
  shelves: Shelf[];
  savedPosts: FeedPost[];
  activeShelf: string | null;
  shelfHref: (id: string | null) => string;
  onCreateShelf: (name: string, itemIds: string[]) => void;
  onExport: () => void;
};

const tints = ["bg-primary-soft text-primary", "bg-amber-100 text-amber-900", "bg-emerald-100 text-emerald-900", "bg-sky-100 text-sky-900"];

const CreateShelf = ({
  savedPosts,
  existing,
  onCreate,
  onCancel,
}: {
  savedPosts: FeedPost[];
  existing: string[];
  onCreate: (name: string, itemIds: string[]) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [items, setItems] = useState<Set<string>>(new Set());
  const trimmed = name.trim();
  const duplicate = existing.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const error = duplicate ? "You already have a shelf with this name." : "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || duplicate) return;
    onCreate(trimmed, [...items]);
  };

  return (
    <form onSubmit={submit} className="mt-3 rounded-lg border border-line bg-surface-low p-3 space-y-3">
      <div>
        <label htmlFor="shelf-name" className="block text-xs font-bold">
          Shelf name
        </label>
        <input
          id="shelf-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          aria-invalid={duplicate}
          aria-describedby={error ? "shelf-name-error" : undefined}
          placeholder="e.g. Lamplight references"
          className="mt-1 w-full h-9 px-3 rounded-lg border border-line bg-white text-sm placeholder:text-muted focus:border-primary/50 outline-none"
        />
        {error && (
          <p id="shelf-name-error" className="mt-1 text-[11px] text-rose-700">
            {error}
          </p>
        )}
      </div>
      <fieldset>
        <legend className="text-xs font-bold">Add saved items</legend>
        {savedPosts.length === 0 ? (
          <p className="mt-1 text-[11px] text-muted">No saved items yet. You can still create an empty shelf.</p>
        ) : (
          <ul className="mt-1.5 space-y-1 max-h-44 overflow-y-auto">
            {savedPosts.map((p) => (
              <li key={p.id}>
                <label className="flex items-start gap-2 py-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={items.has(p.id)}
                    onChange={() =>
                      setItems((s) => {
                        const next = new Set(s);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        return next;
                      })
                    }
                    className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold line-clamp-1">{splitTitle(p.body).title}</span>
                    <span className="block text-muted">{p.author}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!trimmed || duplicate}
          className="h-9 px-4 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create shelf
        </button>
        <button type="button" onClick={onCancel} className="h-9 px-4 rounded-full bg-white border border-line text-xs font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
};

const BookmarksSidebar = ({ shelves, savedPosts, activeShelf, shelfHref, onCreateShelf, onExport }: BookmarksSidebarProps) => {
  const [creating, setCreating] = useState(false);
  const savedIds = new Set(savedPosts.map((p) => p.id));

  return (
    <aside aria-label="Shelves and archive tools" className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:sticky lg:top-5 lg:self-start">
      <section aria-labelledby="shelves-heading" className={`${card} p-4`}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="shelves-heading" className="font-serif text-[17px] font-semibold">
            Your Shelves
          </h2>
          <span className="text-[11px] text-muted">
            {shelves.length} {shelves.length === 1 ? "collection" : "collections"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">Named collections of your saved items.</p>
        {shelves.length > 0 && (
          <ul className="mt-3 space-y-1">
            {shelves.map((s, i) => {
              const count = s.itemIds.filter((id) => savedIds.has(id)).length;
              const active = s.id === activeShelf;
              return (
                <li key={s.id}>
                  <Link
                    to={shelfHref(active ? null : s.id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition ${
                      active ? "bg-primary-soft" : "hover:bg-surface-low"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${tints[i % tints.length]}`} aria-hidden>
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-[13px] font-semibold truncate ${active ? "text-primary" : ""}`}>{s.name}</span>
                      <span className="block text-[11px] text-muted">
                        {count} {count === 1 ? "artefact" : "artefacts"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {creating ? (
          <CreateShelf
            savedPosts={savedPosts}
            existing={shelves.map((s) => s.name)}
            onCancel={() => setCreating(false)}
            onCreate={(name, ids) => {
              onCreateShelf(name, ids);
              setCreating(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-3 w-full h-10 rounded-lg border border-dashed border-primary/40 text-xs font-bold text-primary hover:bg-primary-soft/50 inline-flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Create new shelf
          </button>
        )}
      </section>

      <section aria-labelledby="sovereignty-heading" className={`${card} p-4`}>
        <h2 id="sovereignty-heading" className="flex items-center gap-2 font-serif text-[17px] font-semibold">
          <LockIcon className="w-4 h-4 text-primary" />
          Data Sovereignty
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Your bookmarks and shelves live in this browser only. There's no cloud backup, so export an archive to keep a copy.
        </p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={onExport}
            className="w-full flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left hover:border-primary/40 hover:bg-surface-low transition"
          >
            <span className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <DownloadIcon />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold">Export bookmark archive</span>
              <span className="block text-[11px] text-muted">JSON · saved items and shelves</span>
            </span>
          </button>
          <button
            type="button"
            disabled
            aria-describedby="obsidian-note"
            className="w-full flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-left opacity-60 cursor-not-allowed"
          >
            <span className="w-8 h-8 rounded-md bg-surface-high text-muted flex items-center justify-center shrink-0">
              <LinkIcon className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold">Sync with Obsidian vault</span>
              <span id="obsidian-note" className="block text-[11px] text-muted">
                Unavailable · no Obsidian integration yet
              </span>
            </span>
          </button>
        </div>
      </section>

      <figure className="rounded-xl bg-primary-soft/60 border border-primary/15 p-4 md:col-span-2 lg:col-span-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Curator's note</p>
        <blockquote className="mt-2 font-serif text-lg leading-snug italic text-on-surface">
          “To collect is to construct a memory of what moved you, when the world was moving too fast.”
        </blockquote>
        <figcaption className="mt-2 text-[11px] text-muted">From Circle's editorial notes</figcaption>
      </figure>
    </aside>
  );
};

export default BookmarksSidebar;
