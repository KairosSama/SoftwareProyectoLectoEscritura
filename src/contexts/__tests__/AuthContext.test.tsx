import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// No UI: usamos renderHook con wrapper provider

describe('AuthContext', () => {
  it('signIn y signOut actualizan user', async () => {
    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(()=> useAuth(), { wrapper });
    // signIn
    await act(async () => { await result.current.signIn('a@b.com','pass'); });
    expect(result.current.user?.id).toBe('test-user');
    await act(async () => { await result.current.signOut(); });
    expect(result.current.user).toBeNull();
  });
});
