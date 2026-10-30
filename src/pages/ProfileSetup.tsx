import { useState, type FormEvent } from "react";
import { Logo } from "../components/home/Navigation";
import SignOutButton from "../components/SignOutButton";
import { createProfile, isValidHandle, type NewProfile } from "../lib/profile";

const inputClass =
  "w-full rounded-lg bg-surface-low px-4 py-3 text-on-surface outline-none border border-transparent focus:border-primary/40 focus:bg-white transition";

const labelClass = "block text-sm font-semibold text-on-surface mb-2";

type ProfileSetupProps = {
  userId: string;
  // Called once the row exists; the route then sends the user on to where they were going
  onCreated: (profile: NewProfile) => void;
};

// /setup-profile: required once per account before the app is usable
const ProfileSetup = ({ userId, onCreated }: ProfileSetupProps) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameTaken, setUsernameTaken] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const profile: NewProfile = { username: username.trim().toLowerCase(), displayName: displayName.trim() };
    if (!profile.displayName) {
      setError("Add a display name.");
      return;
    }
    if (!isValidHandle(profile.username)) {
      setError("Usernames use 3–20 letters, numbers or _.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setUsernameTaken(false);
    try {
      const result = await createProfile(userId, profile);
      if (result.ok) {
        onCreated(profile);
        return;
      }
      if (result.reason === "username-taken") {
        setUsernameTaken(true);
        setError(`@${profile.username} is already taken. Try another username.`);
      } else {
        setError("We couldn't save your profile. Please try again.");
      }
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:p-8 flex flex-col items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm">
        <Logo />

        <h1 className="font-serif mt-8 text-3xl font-semibold leading-tight">Set up your profile</h1>
        <p className="mt-2 text-on-surface-variant leading-relaxed">
          Choose how you'll appear in Circle. You can change your display name later.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="setup-display-name" className={labelClass}>
              Display name
            </label>
            <input
              id="setup-display-name"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={submitting}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="setup-username" className={labelClass}>
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden>
                @
              </span>
              <input
                id="setup-username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameTaken(false);
                }}
                disabled={submitting}
                aria-invalid={usernameTaken}
                aria-describedby="setup-username-hint"
                className={`${inputClass} pl-8 ${usernameTaken ? "border-red-400" : ""}`}
              />
            </div>
            <p id="setup-username-hint" className="mt-1.5 text-xs text-muted">
              3–20 letters, numbers or _. Saved in lowercase.
            </p>
          </div>

          <div aria-live="polite" className="text-sm min-h-5">
            {error && <span className="text-red-600 font-semibold">{error}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full h-11 rounded-full bg-primary text-white text-sm font-bold shadow-sm shadow-primary/30 hover:brightness-110 disabled:opacity-60 transition"
          >
            {submitting ? "Saving profile…" : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          <SignOutButton className="font-semibold hover:underline disabled:opacity-60" />
        </div>
      </section>
    </main>
  );
};

export default ProfileSetup;
