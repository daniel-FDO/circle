import Avatar from "../Avatar";
import { SampleTag } from "./EntryCards";
import { suggestedVoices } from "../../data/discovery";
import { sampleEquipment, sampleShelf } from "../../data/profileSamples";
import { voices } from "../../types";

const card = "bg-white border border-line rounded-xl p-4 shadow-[0_1px_2px_rgba(30,27,25,0.04)]";

// Everyone the app knows about, for looking up followed handles
const people = [
  ...voices.map((v) => ({ name: v.name, handle: v.handle, about: v.about })),
  ...suggestedVoices
    .filter((s) => !voices.some((v) => v.handle === s.handle))
    .map((s) => ({ name: s.name, handle: s.handle, about: s.tag })),
];

type ProfileSidebarProps = {
  following: Set<string>;
  onToggleFollow: (handle: string) => void;
};

const ProfileSidebar = ({ following, onToggleFollow }: ProfileSidebarProps) => {
  // Real follows first, topped up with suggestions so the list is never empty
  const followed = people.filter((p) => following.has(p.handle));
  const friends = [...followed, ...people.filter((p) => !following.has(p.handle))].slice(0, Math.max(3, followed.length));

  return (
    <aside className="space-y-4 min-w-0" aria-label="Profile details">
      <section className={card} aria-labelledby="shelf-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="shelf-heading" className="font-serif text-[17px] font-semibold">
            Curated Shelf
          </h2>
          <SampleTag />
        </div>
        <p className="mt-0.5 text-xs text-muted">Books and resources shaping current work.</p>
        <ul className="mt-3 space-y-3">
          {sampleShelf.map((book) => (
            <li key={book.title} className="flex gap-3">
              <span className="w-9 h-12 shrink-0 rounded-sm bg-gradient-to-b from-surface-high to-line border border-line shadow-[inset_3px_0_0_rgba(99,14,212,0.35)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">{book.title}</p>
                <p className="text-xs text-muted">{book.author}</p>
                <p className="text-[11px] font-semibold text-primary">{book.tag}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={card} aria-labelledby="friends-heading">
        <h2 id="friends-heading" className="font-serif text-[17px] font-semibold">
          Studio Friends & Collaborators
        </h2>
        <ul className="mt-3 space-y-3">
          {friends.map((p) => {
            const isFollowing = following.has(p.handle);
            return (
              <li key={p.handle} className="flex items-center gap-2.5">
                <Avatar name={p.name} className="w-9 h-9 text-xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.about}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFollow(p.handle)}
                  aria-pressed={isFollowing}
                  aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${p.name}`}
                  className={`h-8 px-3 rounded-full text-xs font-bold transition ${
                    isFollowing
                      ? "bg-primary text-white"
                      : "bg-surface-low border border-line text-on-surface hover:border-muted"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={card} aria-labelledby="equipment-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="equipment-heading" className="font-serif text-[17px] font-semibold">
            Studio Equipment & Hardware
          </h2>
          <SampleTag />
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {sampleEquipment.map((item) => (
            <li key={item} className="px-2 py-1 rounded-md bg-surface-low border border-line text-xs text-on-surface-variant">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <figure className="rounded-xl bg-primary-soft/60 border border-primary/10 p-4">
        <blockquote className="font-serif italic text-[15px] leading-relaxed text-on-surface">
          “Tools should be quiet enough to let the work speak. We build slowly so that what remains is worth
          returning to.”
        </blockquote>
        <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-wider text-primary">
          Circle Manifesto · Edition 01
        </figcaption>
      </figure>

      <footer className="px-1 text-[11px] leading-relaxed text-muted">
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Accessibility</span>
          <span>Guidelines</span>
        </p>
        <p className="mt-1.5">© 2026 Circle Media. Slow by design.</p>
      </footer>
    </aside>
  );
};

export default ProfileSidebar;
