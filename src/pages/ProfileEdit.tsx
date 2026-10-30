import { useState } from "react";
import { useNavigate } from "react-router";
import PageHeader from "../components/home/PageHeader";
import { card } from "../components/home/styles";
import ProfileFields from "../components/ProfileFields";
import SignOutButton from "../components/SignOutButton";
import TopicsModal from "../components/TopicsModal";
import { PenIcon } from "../components/Icons";
import { allTopics } from "../data/topics";
import { useFeed } from "../layouts/feedContext";
import { isValidHandle } from "../lib/profile";

const MIN_TOPICS = 3;

const sameTopics = (a: string[], b: Set<string>) => a.length === b.size && a.every((t) => b.has(t));

// /profile/edit: edits a draft copy; nothing is applied until Save
const ProfileEdit = () => {
  const { profile, curation, onProfileChange, onCurationChange } = useFeed();
  const [draft, setDraft] = useState(profile);
  const [topics, setTopics] = useState(() => new Set(curation.topics));
  const [topicsOpen, setTopicsOpen] = useState(false);
  const navigate = useNavigate();

  const topicsChanged = !sameTopics(curation.topics, topics);
  const dirty = topicsChanged || JSON.stringify(draft) !== JSON.stringify(profile);
  const problems = [
    !draft.displayName.trim() && "Add a display name.",
    !isValidHandle(draft.handle) && "Handles use 3–20 lowercase letters, numbers or _.",
    topicsChanged && topics.size < MIN_TOPICS && `Choose at least ${MIN_TOPICS} circles.`,
  ].filter(Boolean) as string[];

  const save = () => {
    if (problems.length) return;
    onProfileChange({ ...draft, displayName: draft.displayName.trim() });
    if (topicsChanged) onCurationChange({ ...curation, topics: [...topics] });
    navigate("/profile", { replace: true });
  };

  return (
    <>
      <PageHeader title="Edit profile" />
      <div className="space-y-4">
        {/* ProfileFields brings its own top margin, so skip the top padding */}
        <section className={`${card} px-5 pb-5 md:px-6 md:pb-6`} aria-label="Edit profile">
          <ProfileFields
            profile={draft}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          />
        </section>

        <section className={`${card} p-5 md:p-6`} aria-labelledby="circles-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="circles-heading" className="font-serif text-lg font-semibold">
              Your circles
            </h2>
            <button
              type="button"
              onClick={() => setTopicsOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <PenIcon className="w-3.5 h-3.5" /> Edit circles
            </button>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Your “For you” feed is built from these topics. Following {curation.following.length}{" "}
            {curation.following.length === 1 ? "person" : "people"}.
          </p>
          {topics.size === 0 ? (
            <p className="mt-3 text-sm text-muted">No circles chosen, so your feed shows everything.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {[...topics].map((topic) => (
                <li key={topic} className="px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
                  {topic}
                </li>
              ))}
            </ul>
          )}
          <TopicsModal
            open={topicsOpen}
            topics={allTopics}
            selected={topics}
            onToggle={(topic) => {
              setTopics((s) => {
                const next = new Set(s);
                if (next.has(topic)) next.delete(topic);
                else next.add(topic);
                return next;
              });
            }}
            onClose={() => setTopicsOpen(false)}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="text-sm">
            {problems.length > 0 ? (
              <span className="text-red-600 font-semibold">{problems[0]}</span>
            ) : dirty ? (
              <span className="text-muted">You have unsaved changes.</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/profile", { replace: true })}
              className="h-10 px-4 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-surface-high"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || problems.length > 0}
              className="h-10 px-6 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 disabled:opacity-40 transition"
            >
              Save profile
            </button>
          </div>
        </div>

        <section className={`${card} p-5 md:p-6 flex flex-wrap items-center justify-between gap-3`} aria-labelledby="account-heading">
          <div>
            <h2 id="account-heading" className="font-serif text-lg font-semibold">
              Account
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">Sign out of Circle on this device.</p>
          </div>
          <div>
            <SignOutButton className="h-10 px-5 rounded-full border border-line text-sm font-semibold text-on-surface-variant hover:bg-surface-high disabled:opacity-60" />
          </div>
        </section>
      </div>
    </>
  );
};

export default ProfileEdit;
