import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => {
  const auth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resend: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn()
  };
  return { supabase: { auth, storage: { from: vi.fn() }, from: vi.fn() } };
});

describe('Flujo de email (signup -> pending)', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/login');
    sessionStorage.clear();
    (supabase.auth.signUp as any).mockResolvedValue({ data: { session: null } });
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('redirige a /auth/pending cuando signup necesita confirmación', async () => {
    render(<App />);
    // Ir a signup
    const toggle = screen.getByText(/¿Necesitas una cuenta\? Regístrate/i);
    fireEvent.click(toggle);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Profesor Test' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
    // La UI ahora exige contraseña fuerte con símbolo, confirmación y aceptar términos
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByLabelText(/Acepto los/i));
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/auth/pending');
    });
  });
});

describe('Flujo login con email no confirmado', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/login');
    sessionStorage.clear();
    (supabase.auth.signInWithPassword as any).mockRejectedValue({ message: 'Email not confirmed' });
  });

  it('redirige a pending y muestra aviso por intento de login con email sin confirmar', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test2@example.com' } });
  fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'Secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/auth/pending');
    });

    await screen.findByText(/Intentaste iniciar sesión/i);
  });
});
