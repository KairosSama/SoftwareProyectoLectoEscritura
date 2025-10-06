import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentPDFUpload from '../StudentPDFUpload';
import { AuthProvider } from '../../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock supabase storage + from insert + public URL
vi.mock('../../../lib/supabase', () => {
  const uploadFn = vi.fn().mockResolvedValue({ data: { path: 's1/file.pdf' }, error: null });
  const storage = { from: () => ({ upload: uploadFn, getPublicUrl: () => ({ data: { publicUrl: 'https://public/url/file.pdf' } }) }) };
  const fromFn = () => ({ insert: () => ({ select: () => Promise.resolve({ data: [{ id: 'doc1' }], error: null }) }) });
  const auth = {
    getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: { id: 'test-user' } }, error: null }),
    signUp: async () => ({ data: { user: { id: 'test-user' } }, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    getUser: async () => ({ data: { user: { id: 'test-user' } }, error: null })
  };
  return { supabase: { storage, from: fromFn, auth } };
});

// Mock fetch call for edge function
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as any;

const wrapper = ({ children }: any) => <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>;

describe('StudentPDFUpload', () => {
  it('sube pdf exitosamente', async () => {
    render(<StudentPDFUpload studentId="s1" />, { wrapper });
    const fileInput = screen.getByLabelText(/pdf/i) as HTMLInputElement;
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Subir PDF' }));
    await waitFor(()=> expect(screen.getByText('PDF subido correctamente.')).toBeInTheDocument());
  });
});
