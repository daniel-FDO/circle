import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export const isValidHandle = (handle: string) => /^[a-z0-9_]{3,20}$/.test(handle);

// Postgres unique_violation, returned by PostgREST as the error code
const UNIQUE_VIOLATION = "23505";

const fetchHasProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data !== null;
};

export type ProfileStatus = "loading" | "missing" | "ready" | "error";

// Whether the signed-in user has a row in public.profiles; re-checks whenever the user changes
export const useProfileStatus = (userId: string | null) => {
  // Tagged with the user it belongs to, so a result for a previous user is never reused
  const [result, setResult] = useState<{ userId: string; status: Exclude<ProfileStatus, "loading"> } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetchHasProfile(userId)
      .then((exists) => {
        if (active) setResult({ userId, status: exists ? "ready" : "missing" });
      })
      .catch(() => {
        if (active) setResult({ userId, status: "error" });
      });
    return () => {
      active = false;
    };
  }, [userId, attempt]);

  const status: ProfileStatus = result && result.userId === userId ? result.status : "loading";

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);

  const markCreated = useCallback((createdFor: string) => setResult({ userId: createdFor, status: "ready" }), []);

  return { status, retry, markCreated };
};

export type NewProfile = { username: string; displayName: string };

export type CreateProfileResult = { ok: true } | { ok: false; reason: "username-taken" | "failed"; message?: string };

// Inserts the user's own row; RLS only allows id = auth.uid()
export const createProfile = async (userId: string, { username, displayName }: NewProfile): Promise<CreateProfileResult> => {
  const { error } = await supabase.from("profiles").insert({ id: userId, username, display_name: displayName });
  if (!error) return { ok: true };

  if (error.code === UNIQUE_VIOLATION) {
    // Either the username is taken or this user's row already exists (e.g. created in another tab)
    try {
      if (await fetchHasProfile(userId)) return { ok: true };
    } catch {
      // Fall through and report the conflict as a username clash
    }
    return { ok: false, reason: "username-taken" };
  }
  return { ok: false, reason: "failed", message: error.message };
};
