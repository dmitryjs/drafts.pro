import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getAuthRedirectUrl, getRememberMePreference, isSupabaseConfigured, setRememberMePreference } from '@/lib/supabase';
import { mapProfileRow } from "@/lib/supabase-helpers";

interface Profile {
  id: number;
  authUid: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberMe, setRememberMeState] = useState(getRememberMePreference());

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    setRememberMePreference(rememberMe);
  }, [rememberMe]);

  useEffect(() => {
    if (!supabase || rememberMe) {
      return;
    }

    const clearSessionStorage = () => {
      try {
        if (supabase.auth?.storageKey && typeof window !== "undefined") {
          window.localStorage.removeItem(supabase.auth.storageKey);
        }
      } catch (error) {
        console.warn("Failed to clear auth storage:", error);
      }
    };

    window.addEventListener("beforeunload", clearSessionStorage);
    window.addEventListener("pagehide", clearSessionStorage);

    return () => {
      window.removeEventListener("beforeunload", clearSessionStorage);
      window.removeEventListener("pagehide", clearSessionStorage);
    };
  }, [rememberMe]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      }
      setIsLoading(false);
    });

    // Обрабатываем изменения состояния авторизации (включая OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchOrCreateProfile(session.user);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchOrCreateProfile(user: User) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_uid", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(mapProfileRow(data));
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("profiles")
        .insert({
          auth_uid: user.id,
          email: user.email || "",
        })
        .select("*")
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(mapProfileRow(created));
    } catch (error) {
      console.error("Error fetching/creating profile:", error);
      // Не устанавливаем profile в null при ошибке, чтобы не сломать UI
    }
  }

  async function signInWithOtp(email: string) {
    if (!supabase) return { error: new Error('Supabase not configured') };
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    return { error: error as Error | null };
  }

  async function verifyOtp(email: string, token: string) {
    if (!supabase) return { error: new Error('Supabase not configured') };
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        rememberMe,
        setRememberMe: setRememberMeState,
        signInWithOtp,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
