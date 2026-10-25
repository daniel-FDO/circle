import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon, PlusIcon, SearchIcon } from "./Icons";

type TopicsModalProps = {
  open: boolean;
  topics: string[];
  selected: Set<string>;
  onToggle: (topic: string) => void;
  onClose: () => void;
};

const TopicsModal = ({ open, topics, selected, onToggle, onClose }: TopicsModalProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  // Native <dialog> gives us Esc-to-close, focus trapping and the backdrop for free
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const filtered = topics.filter((t) =>
    t.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setQuery("");
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-on-surface/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col max-h-[85vh]">
        <header className="p-6 md:p-8 pb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                All topics
              </p>
              <h2 className="font-serif mt-1 text-2xl font-semibold text-on-surface">
                Disciplines & Mediums
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-surface-low text-muted hover:text-on-surface flex items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="relative mt-5">
            <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${topics.length} topics`}
              className="w-full rounded-full bg-surface-low pl-11 pr-4 py-3 text-sm text-on-surface outline-none border border-transparent focus:border-primary/40 focus:bg-white transition"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-2">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No topics match “{query}”.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filtered.map((topic) => {
                const on = selected.has(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(topic)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                      on
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-high text-on-surface hover:bg-surface-low"
                    }`}
                  >
                    {on ? <CheckIcon /> : <PlusIcon className="w-3.5 h-3.5 text-muted" />}
                    {topic}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <footer className="p-6 md:px-8 flex justify-between items-center border-t border-surface-high mt-4">
          <span className="text-sm font-bold text-on-surface">{selected.size} Selected</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition"
          >
            Done
          </button>
        </footer>
      </div>
    </dialog>
  );
};

export default TopicsModal;
