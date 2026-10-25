import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { loadSession, saveSession } from "./lib/session";
import Bookmarks from "./pages/Bookmarks";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import type { Curation, Profile as ProfileData } from "./types";

function App() {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const updateProfile = (patch: Partial<ProfileData>) =>
    setSession((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  const updateCuration = (curation: Curation) => setSession((s) => ({ ...s, curation }));
  const completeOnboarding = (curation: Curation) =>
    setSession((s) => ({ ...s, curation, onboarded: true, joinedAt: s.joinedAt ?? new Date().toISOString() }));

  // Only treat the user as onboarded when there's a curation to build the feed from
  const curation = session.onboarded ? session.curation : null;

  return (
    <BrowserRouter>
      <Routes>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
