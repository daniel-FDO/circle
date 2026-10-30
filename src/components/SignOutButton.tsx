import { useState } from "react";
import { signOut } from "../lib/auth";

type SignOutButtonProps = {
  className?: string;
  role?: string;
};

// The route guard redirects to /sign-in once Supabase reports the session is gone
const SignOutButton = ({ className = "", role }: SignOutButtonProps) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    const message = await signOut();
    // On success this component unmounts with the signed-in layout
    if (message) {
      setError(message);
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" role={role} onClick={run} disabled={pending} aria-busy={pending} className={className}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <p role="alert" className="px-3 pb-2 text-xs text-red-600 font-semibold">
          {error}
        </p>
      )}
    </>
  );
};

export default SignOutButton;
