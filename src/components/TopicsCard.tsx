import { useState } from "react";
import { ArrowIcon, CheckIcon, PlusIcon } from "./Icons";
import TopicsModal from "./TopicsModal";
import { voices, type Curation } from "../types";
import { allTopics, featuredTopics } from "../data/topics";

const MIN_TOPICS = 3;

const toggle = (set: Set<string>, value: string) => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

const defaultTopics = ["Tactile Web", "Architecture", "Ceramics & Craft", "Editorial Design"];

type TopicsCardProps = {
  initial: Curation | null;
  onComplete: (curation: Curation) => void;
};

const TopicsCard = ({ initial, onComplete }: TopicsCardProps) => {
  // Restore the previous picks when coming back from Home to edit the profile
  const [selected, setSelected] = useState(
    () => new Set(initial?.topics.length ? initial.topics : defaultTopics),
  );
  const [following, setFollowing] = useState(() => new Set(initial ? initial.following : ["sophiachen"]));
  const [showAll, setShowAll] = useState(false);

  const canContinue = selected.size >= MIN_TOPICS;
  // Topics picked from the modal also show up as chips on the card
  const visibleTopics = [
    ...featuredTopics,
    ...allTopics.filter((t) => selected.has(t) && !featuredTopics.includes(t)),
  ];

  return (
    <section className="bg-white rounded-2xl p-8 md:p-10 shadow-sm flex flex-col">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Step 03 — Curation
          </p>
          <h2 className="font-serif mt-2 text-3xl font-semibold">
            Choose your Circles & Topics
          </h2>
        </div>
        <div className="text-right shrink-0 mt-5">
          <p className="text-sm font-bold">{selected.size} Selected</p>
          <p className={`text-xs ${canContinue ? "text-muted" : "text-red-600"}`}>
            Minimum {MIN_TOPICS} topics
          </p>
        </div>
      </div>
      <p className="mt-3 text-on-surface-variant leading-relaxed">
        Circle constructs your daily feed around deliberate themes and
        practitioner work rather than viral triggers.
      </p>

      <div className="mt-8 flex justify-between items-baseline">
        <h3 className="text-sm font-bold">Disciplines & Mediums</h3>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-xs font-bold text-primary hover:underline"
        >
          Explore all {allTopics.length} topics
        </button>
      </div>
      <TopicsModal
        open={showAll}
        topics={allTopics}
        selected={selected}
        onToggle={(topic) => setSelected((s) => toggle(s, topic))}
        onClose={() => setShowAll(false)}
      />
      <div className="mt-4 flex flex-wrap gap-3">
        {visibleTopics.map((topic) => {
          const on = selected.has(topic);
          return (
            <button
              key={topic}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected((s) => toggle(s, topic))}
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

      <div className="mt-10 flex justify-between items-baseline">
        <h3 className="text-sm font-bold">Suggested Voices for Your Shelf</h3>
        <span className="text-xs text-muted">Curated for craft</span>
      </div>
      <ul className="mt-4 space-y-3">
        {voices.map((voice) => {
          const isFollowing = following.has(voice.handle);
          return (
            <li
              key={voice.handle}
              className="flex items-center gap-4 p-3 rounded-xl bg-surface-low"
            >
              <div className="w-11 h-11 rounded-full bg-surface-high flex items-center justify-center font-serif text-lg text-muted shrink-0">
                {voice.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-semibold">{voice.name}</span>
                  {voice.tag && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${voice.tagClass}`}
                    >
                      {voice.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant truncate">
                  @{voice.handle} • {voice.about}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFollowing((s) => toggle(s, voice.handle))}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
                  isFollowing
                    ? "bg-primary text-white"
                    : "bg-white text-on-surface shadow-sm hover:bg-surface-high"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-12 flex justify-between items-center">
        <button
          type="button"
          onClick={() => onComplete({ topics: [], following: [...following] })}
          className="text-sm font-semibold text-muted hover:text-on-surface"
        >
          Skip for now
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() =>
            onComplete({ topics: [...selected], following: [...following] })
          }
          className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:brightness-110 disabled:opacity-40 disabled:shadow-none transition"
        >
          Complete profile & Enter Circle <ArrowIcon />
        </button>
      </div>
    </section>
  );
};

export default TopicsCard;
