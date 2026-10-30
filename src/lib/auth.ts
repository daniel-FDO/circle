import { useEffect, useState } from "react";
import { isAuthError, type Session as AuthSession } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Where confirmation links send people back to; must be in Supabase's allowed Redirect URLs
export const AUTH_REDIRECT_URL = import.meta.env.DEV ? "http://localhost:5173" : window.location.origin;

export type AuthState = { loading: boolean; session: AuthSession | null };

// Restores the saved Supabase session on load and follows sign-in/out from any tab
export const useAuthSession = (): AuthState => {
  const [state, setState] = useState<AuthState>({ loading: true, session: null });

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setState({ loading: false, session: data.session });
      })
      .catch(() => {
        if (active) setState({ loading: false, session: null });
      });

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the client
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ loading: false, session });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
};

const friendlyMessages: Record<string, string> = {
  invalid_credentials: "That email and password don't match. Check them and try again.",
  email_not_confirmed: "Please confirm your email first. Check your inbox for the link we sent.",
  user_already_exists: "An account with this email already exists. Try signing in instead.",
  email_exists: "An account with this email already exists. Try signing in instead.",
  weak_password: "Choose a stronger password: at least 6 characters, ideally more.",
  email_address_invalid: "That email address doesn't look right.",
  over_email_send_rate_limit: "Too many emails sent recently. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  signup_disabled: "New sign-ups are currently closed.",
};

export const authErrorMessage = (error: unknown) => {
  if (isAuthError(error)) {
    if (error.code && friendlyMessages[error.code]) return friendlyMessages[error.code];
    // Retryable fetch errors have status 0 and mean the request never reached Supabase
    if (error.status === 0) return "We couldn't reach the server. Check your connection and try again.";
    return error.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error ? authErrorMessage(error) : null;
};
