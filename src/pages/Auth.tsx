import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { Logo } from "../components/home/Navigation";
import { AUTH_REDIRECT_URL, authErrorMessage } from "../lib/auth";
import { supabase } from "../lib/supabase";

const inputClass =
  "w-full rounded-lg bg-surface-low px-4 py-3 text-on-surface outline-none border border-transparent focus:border-primary/40 focus:bg-white transition";

const labelClass = "block text-sm font-semibold text-on-surface mb-2";

const MIN_PASSWORD = 6;

type Mode = "sign-in" | "sign-up";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "check-inbox"; email: string };

// /sign-in and /sign-up: Supabase email + password auth.
// Once a session exists the route guard in App sends people on, so success needs no navigate here.
const Auth = ({ mode }: { mode: Mode }) => {
  const location = useLocation();
  const signingUp = mode === "sign-up";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = email.trim();
    if (signingUp && password.length < MIN_PASSWORD) {
      setStatus({ kind: "error", message: `Use at least ${MIN_PASSWORD} characters for your password.` });
      return;
    }

    setSubmitting(true);
    setStatus({ kind: "idle" });
    try {
      if (signingUp) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: { emailRedirectTo: AUTH_REDIRECT_URL },
        });
        if (error) throw error;
        // With email confirmation on there's no session yet; only an active session counts as signed in
        if (!data.session) {
          setStatus({ kind: "check-inbox", email: trimmed });
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
        if (error) throw error;
      }
    } catch (error) {
      setStatus({ kind: "error", message: authErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:p-8 flex flex-col items-center justify-center">
      <section className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 shadow-sm">
        <Logo />

        <h1 className="font-serif mt-8 text-3xl font-semibold leading-tight">
          {signingUp ? "Join Circle" : "Welcome back"}
        </h1>
        <p className="mt-2 text-on-surface-variant leading-relaxed">
          {signingUp
            ? "Create an account to start curating your quiet corner of the web."
            : "Sign in to return to your circles."}
        </p>

        {status.kind === "check-inbox" ? (
          <div role="status" className="mt-8 p-4 rounded-xl bg-primary-soft text-on-surface">
            <p className="font-semibold">Check your inbox</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              If <span className="font-semibold">{status.email}</span> isn't already registered, we've sent it a
              confirmation link. Open it to finish creating your account, then sign in.
            </p>
            <Link to="/sign-in" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="auth-email" className={labelClass}>
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="auth-password" className={labelClass}>
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={signingUp ? "new-password" : "current-password"}
                required
                minLength={signingUp ? MIN_PASSWORD : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-describedby={signingUp ? "auth-password-hint" : undefined}
                className={inputClass}
              />
              {signingUp && (
                <p id="auth-password-hint" className="mt-1.5 text-xs text-muted">
                  At least {MIN_PASSWORD} characters.
                </p>
              )}
            </div>

            <div aria-live="polite" className="text-sm min-h-5">
              {status.kind === "error" && <span className="text-red-600 font-semibold">{status.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full h-11 rounded-full bg-primary text-white text-sm font-bold shadow-sm shadow-primary/30 hover:brightness-110 disabled:opacity-60 transition"
            >
              {submitting
                ? signingUp
                  ? "Creating account…"
                  : "Signing in…"
                : signingUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-center text-on-surface-variant">
          {signingUp ? "Already have an account? " : "New to Circle? "}
          <Link
            to={signingUp ? "/sign-in" : "/sign-up"}
            state={location.state}
            replace
            className="font-bold text-primary hover:underline"
          >
            {signingUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Auth;
