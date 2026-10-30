import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { Logo } from "./components/home/Navigation";
import AppLayout from "./layouts/AppLayout";
import SignOutButton from "./components/SignOutButton";
import { useAuthSession, type AuthState } from "./lib/auth";
import { useProfileStatus, type NewProfile, type ProfileStatus } from "./lib/profile";
import { loadSession, saveSession } from "./lib/session";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Bookmarks from "./pages/Bookmarks";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import type { Curation, Profile as ProfileData } from "./types";

// Router state set by RequireAuth and RequireProfile so people return where they were going
type AuthRedirectState = { from?: string } | null;

const AuthLoading = ({ message = "Checking your session…" }: { message?: string }) => (
  <main className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3" aria-busy="true">
    <Logo />
    <p role="status" className="text-sm text-muted">
      {message}
    </p>
  </main>
);

const ProfileCheckFailed = ({ onRetry }: { onRetry: () => void }) => (
  <main className="min-h-screen bg-surface px-4 flex flex-col items-center justify-center gap-4 text-center">
    <Logo />
    <p role="alert" className="text-sm text-on-surface-variant max-w-sm">
      We couldn't load your profile. Check your connection and try again.
    </p>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRetry}
        className="h-10 px-5 rounded-full bg-primary text-white text-sm font-bold hover:brightness-110 transition"
      >
        Try again
      </button>
      <SignOutButton className="h-10 px-5 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-surface-high disabled:opacity-60" />
    </div>
  </main>
);

type ProfileGate = { status: ProfileStatus; retry: () => void };

// Signed-in users without a public.profiles row must finish setup before using the app
const RequireProfile = ({ profile }: { profile: ProfileGate }) => {
  const location = useLocation();
  if (profile.status === "loading") return <AuthLoading message="Loading your profile…" />;
  if (profile.status === "error") return <ProfileCheckFailed onRetry={profile.retry} />;
  if (profile.status === "missing") {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/setup-profile" replace state={{ from } satisfies AuthRedirectState} />;
  }
  return <Outlet />;
};

// UX only: Row Level Security in the database is what actually protects data
const RequireAuth = ({ auth }: { auth: AuthState }) => {
  const location = useLocation();
  if (auth.loading) return <AuthLoading />;
  if (!auth.session) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/sign-in" replace state={{ from } satisfies AuthRedirectState} />;
  }
  return <Outlet />;
};

// Sign-in and sign-up are only for signed-out visitors
const SignedOutOnly = ({ auth }: { auth: AuthState }) => {
  const location = useLocation();
  if (auth.loading) return <AuthLoading />;
  if (auth.session) return <Navigate to={(location.state as AuthRedirectState)?.from ?? "/"} replace />;
  return <Outlet />;
};

type SetupProfileRouteProps = {
  userId: string | null;
  profile: ProfileGate;
  onCreated: (userId: string, profile: NewProfile) => void;
};

const SetupProfileRoute = ({ userId, profile, onCreated }: SetupProfileRouteProps) => {
  const location = useLocation();
  if (profile.status === "loading" || !userId) return <AuthLoading message="Loading your profile…" />;
  if (profile.status === "error") return <ProfileCheckFailed onRetry={profile.retry} />;
  // Users who already have a profile skip setup and continue where they were headed
  if (profile.status === "ready") return <Navigate to={(location.state as AuthRedirectState)?.from ?? "/"} replace />;
  // Keyed by user so a different account signing in starts with an empty form
  return <ProfileSetup key={userId} userId={userId} onCreated={(p) => onCreated(userId, p)} />;
};

function App() {
  const auth = useAuthSession();
  const userId = auth.session?.user.id ?? null;
  const profileStatus = useProfileStatus(userId);
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const updateProfile = (patch: Partial<ProfileData>) =>
    setSession((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  const updateCuration = (curation: Curation) => setSession((s) => ({ ...s, curation }));
  const completeOnboarding = (curation: Curation) =>
    setSession((s) => ({ ...s, curation, onboarded: true, joinedAt: s.joinedAt ?? new Date().toISOString() }));

  const profileCreated = (createdFor: string, profile: NewProfile) => {
    // Carry the new identity into the locally stored profile shown around the app
    updateProfile({ displayName: profile.displayName, handle: profile.username });
    profileStatus.markCreated(createdFor);
  };

  // Only treat the user as onboarded when there's a curation to build the feed from
  const curation = session.onboarded ? session.curation : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SignedOutOnly auth={auth} />}>
          {/* Keyed so switching forms starts fresh instead of keeping the other form's state */}
          <Route path="/sign-in" element={<Auth key="sign-in" mode="sign-in" />} />
          <Route path="/sign-up" element={<Auth key="sign-up" mode="sign-up" />} />
        </Route>

        <Route element={<RequireAuth auth={auth} />}>
          <Route
            path="/setup-profile"
            element={<SetupProfileRoute userId={userId} profile={profileStatus} onCreated={profileCreated} />}
          />

          <Route element={<RequireProfile profile={profileStatus} />}>
            <Route path="/" element={<Navigate to={curation ? "/home" : "/onboarding"} replace />} />
            <Route
              path="/onboarding"
              element={
                curation ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Onboarding
                    profile={session.profile}
                    initialCuration={session.curation}
                    onProfileChange={updateProfile}
                    onComplete={completeOnboarding}
                  />
                )
              }
            />

            {/* Guarded app routes share the sidebar layout */}
            <Route
              element={
                curation ? (
                  <AppLayout
                    profile={session.profile}
                    curation={curation}
                    joinedAt={session.joinedAt}
                    onProfileChange={(profile) => updateProfile(profile)}
                    onCurationChange={updateCuration}
                  />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* One route so the page (search, filters, drafts) stays mounted while switching threads */}
              <Route path="/messages/:conversationId?" element={<Messages />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
