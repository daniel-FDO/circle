import { useNavigate } from "react-router";
import ProfileCard from "../components/ProfileCard";
import TopicsCard from "../components/TopicsCard";
import type { Curation, Profile } from "../types";

type OnboardingProps = {
  profile: Profile;
  initialCuration: Curation | null;
  onProfileChange: (patch: Partial<Profile>) => void;
  onComplete: (curation: Curation) => void;
};

const Onboarding = ({ profile, initialCuration, onProfileChange, onComplete }: OnboardingProps) => {
  const navigate = useNavigate();

  const complete = (curation: Curation) => {
    onComplete(curation);
    // Replace so Back from /home doesn't land on a finished onboarding screen
    navigate("/home", { replace: true });
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ProfileCard profile={profile} onChange={onProfileChange} />
        <TopicsCard initial={initialCuration} onComplete={complete} />
      </div>

      <footer className="mt-12 text-center">
        <p className="font-serif italic text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          “The digital environment should feel like a library gallery bathed in
          morning sun — unhurried, tactile, and built for contemplation.”
        </p>
        <p className="mt-2 text-xs text-muted">Circle Manifesto • Edition No. 1</p>
      </footer>
    </main>
  );
};

export default Onboarding;
