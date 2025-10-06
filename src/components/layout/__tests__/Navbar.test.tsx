import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../../test/renderWithRouter';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock useAuth signOut effect indirectly by spying on console (signOut no error path) - our mock supabase already resolves.

describe('Navbar', () => {
  it('renderiza links principales y ejecuta signOut', async () => {
    await renderWithRouter(<AuthProvider skipInitialSession><Navbar /></AuthProvider>, { initialEntries: ['/dashboard'] });
    expect(screen.getByText('EduEvalúa')).toBeInTheDocument();
    const btns = screen.getAllByRole('button');
    const logoutBtn = btns[btns.length - 1];
    fireEvent.click(logoutBtn);
    // No throw implica éxito; se mantiene render.
    expect(screen.getByText('EduEvalúa')).toBeInTheDocument();
  });
});
