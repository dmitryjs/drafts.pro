import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const rememberMeKey = "drafts_remember_me";

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const raw = window.localStorage.getItem(rememberMeKey);
  return raw !== "false";
}

export function setRememberMePreference(remember: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(rememberMeKey, remember ? "true" : "false");
}

export function getAuthRedirectUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured) {
    return `${configured.replace(/\/$/, "")}/auth`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth`;
  }
  return "/auth";
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window === "undefined"
      ? undefined
      : getRememberMePreference()
        ? window.localStorage
        : window.sessionStorage,
  },
});

// Проверка, что Supabase настроен
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}