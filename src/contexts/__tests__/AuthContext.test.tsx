import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

// Mock del módulo supabase con API auth completa para los tests
vi.mock('../../lib/supabase', () => {
  const auth = {
    getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: { id: 'test-user' } }, error: null }),
    signUp: async () => ({ data: { user: { id: 'test-user' } }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null })
  };
  return { supabase: { auth } };
});

// No UI: usamos renderHook con wrapper provider

describe('AuthContext', () => {
  it('signIn y signOut actualizan user', async () => {
  const wrapper = ({ children }: any) => <AuthProvider skipInitialSession>{children}</AuthProvider>;
    const { result } = renderHook(()=> useAuth(), { wrapper });
    // signIn
    await act(async () => { await result.current.signIn('a@b.com','pass'); });
    expect(result.current.user?.id).toBe('test-user');
    await act(async () => { await result.current.signOut(); });
    expect(result.current.user).toBeNull();
  });

  it('signIn error lanza excepción', async () => {
  const wrapper = ({ children }: any) => <AuthProvider skipInitialSession>{children}</AuthProvider>;
    const { result } = renderHook(()=> useAuth(), { wrapper });
    const spy = vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({ data: { user: null }, error: new Error('invalid') } as any);
    await expect(result.current.signIn('x@y.com','nope')).rejects.toThrow('invalid');
    spy.mockRestore();
  });
});
