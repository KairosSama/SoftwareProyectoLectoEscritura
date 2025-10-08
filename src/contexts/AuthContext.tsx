import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// TODO: Migrar funciones de autenticación a Supabase

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ email: string; needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children, skipInitialSession }: { children: React.ReactNode; skipInitialSession?: boolean }) {
  const [user, setUser] = useState<any | null>(null);
  const autoSkip = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const effectiveSkip = skipInitialSession || autoSkip;
  const [loading, setLoading] = useState(!effectiveSkip);

  useEffect(() => {
    if (effectiveSkip) return; // saltamos consulta inicial en tests o si se solicita
    let active = true;
  supabase.auth.getSession().then(({ data }: any) => {
      if (!active) return;
      setUser(data?.session?.user || null);
      setLoading(false);
    });
  const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!active) return;
      setUser(session?.user || null);
    });
    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, [effectiveSkip]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const redirectTo = `${window.location.origin}/auth/confirm`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { fullName, role }
      }
    });
    if (error) throw error;
    // Si la instancia requiere confirmación de email, data.session será null.
    const needsConfirmation = !data.session;
    if (data.session?.user) {
      setUser(data.session.user);
    } else {
      // Guardamos email en sessionStorage para páginas /auth/pending y /auth/confirm
      try { sessionStorage.setItem('pending_signup_email', email); } catch {}
    }
    return { email, needsConfirmation };
  };

  const resendConfirmation = async (email: string) => {
    const redirectTo = `${window.location.origin}/auth/confirm`;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    resendConfirmation,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}