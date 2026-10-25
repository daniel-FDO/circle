import Stepper from "./Stepper";
import ProfileFields from "./ProfileFields";
import { LockIcon } from "./Icons";
import type { Profile } from "../types";

type ProfileCardProps = {
  profile: Profile;
  onChange: (patch: Partial<Profile>) => void;
};

const ProfileCard = ({ profile, onChange }: ProfileCardProps) => {
  return (
    <section className="bg-white rounded-2xl p-8 md:p-10 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-surface-high flex items-center justify-center">
            <span className="w-4 h-4 rounded-full border-[3px] border-primary" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
          <span className="font-serif text-xl font-semibold">Circle</span>
        </div>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted px-3 py-1 rounded-full bg-surface-high">
          Edition 01
        </span>
      </div>

      <h1 className="font-serif mt-8 text-3xl md:text-4xl font-semibold leading-tight">
        A quiet, intentional home for creative work.
      </h1>
      <p className="mt-3 text-on-surface-variant leading-relaxed">
        Craft your presence before stepping into curated dialogues, quiet
        feeds, and community salons.
      </p>

      <Stepper current={1} />

      <ProfileFields profile={profile} onChange={onChange} />

      <div className="mt-8 flex justify-between text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <LockIcon /> No algorithmic push, no tracked metrics.
        </span>
        <span>Encrypted & Self-hosted</span>
      </div>
    </section>
  );
};

export default ProfileCard;
