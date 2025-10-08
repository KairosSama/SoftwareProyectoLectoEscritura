import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Documents from '../Documents';

// Mock AuthContext to provide a stable user
const stableUser = { id: 'user-123', email: 'user@test.com' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: stableUser, loading: false })
}));

// In‑memory stores to emulate supabase behaviour
interface StorageObj { name: string; updated_at?: string; metadata?: { size?: number; mimetype?: string } }
let globalDocsLecto: StorageObj[] = [
  { name: 'Manual1.pdf', updated_at: new Date().toISOString(), metadata: { size: 1024, mimetype: 'application/pdf' } }
];
let globalDocsMate: StorageObj[] = [
  { name: 'Math1.pdf', updated_at: new Date().toISOString(), metadata: { size: 2048, mimetype: 'application/pdf' } }
];
let userDocsStorage: StorageObj[] = []; // user_docs bucket objects under user-123/
let studentDocumentsRows: Array<{ id: string; file_url: string; uploaded_at: string; created_by: string }> = [];

// Helper to derive folder from prefix
function listBucket(bucket: string, prefix: string) {
  if (bucket === 'global-docs') {
    if (prefix === 'lectoescritura/' || prefix === 'lectoescritura') return globalDocsLecto;
    if (prefix === 'matematicas/' || prefix === 'matematicas') return globalDocsMate;
  }
  if (bucket === 'user_docs') {
    // prefix userId/
  return userDocsStorage.slice();
  }
  return [];
}

// Mock supabase client
vi.mock('../../lib/supabase', () => {
  return {
    supabase: {
      storage: {
        from: (bucket: string) => ({
          list: async (prefix: string) => {
            const data = listBucket(bucket, prefix).map(o => ({ ...o }));
            return { data, error: null };
          },
          upload: async (path: string, file: File) => {
            // path: user-123/<timestamp>_filename
            const parts = path.split('/');
            const name = parts[1];
            userDocsStorage.push({ name, updated_at: new Date().toISOString(), metadata: { size: file.size, mimetype: file.type } });
            return { data: { path }, error: null };
          },
          remove: async (paths: string[]) => {
            paths.forEach(p => {
              const name = p.split('/')[1];
              userDocsStorage = userDocsStorage.filter(o => o.name !== name);
            });
            return { data: {}, error: null };
          },
          createSignedUrl: async (path: string) => ({ data: { signedUrl: 'https://signed/' + path }, error: null }),
        })
      },
      from: (table: string) => {
        if (table === 'student_documents') {
          return {
            select: function() {
              return {
                eq: (_col: string, _val: string) => ({
                  order: () => Promise.resolve({ data: studentDocumentsRows.slice(), error: null })
                })
              };
            },
            insert: async (rows: any) => {
              const row = Array.isArray(rows) ? rows[0] : rows;
              const created = { id: 'doc-' + (studentDocumentsRows.length + 1), file_url: row.file_url, uploaded_at: new Date().toISOString(), created_by: row.created_by };
              studentDocumentsRows.push(created);
              return { data: [created], error: null };
            },
            delete: () => ({ eq: (_c: string, val: string) => ({ eq: () => { studentDocumentsRows = studentDocumentsRows.filter(r => r.file_url !== val); return Promise.resolve({ data: {}, error: null }); } }) })
          } as any;
        }
        return {} as any;
      },
      auth: { getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }) }
    }
  };
});

describe('Documents integration', () => {
  beforeEach(() => {
    userDocsStorage = [];
    studentDocumentsRows = [];
  });

  it('muestra documentos globales y permite subir un documento personal', async () => {
    render(<Documents />);
    // Global docs visibles
  // Esperar la aparición de ambos documentos globales (puede tardar microtask)
  await screen.findByText('Manual1.pdf');
  await screen.findByText('Math1.pdf');
  expect(screen.getByText('Manual1.pdf')).toBeInTheDocument();
  expect(screen.getByText('Math1.pdf')).toBeInTheDocument();

  // Inicialmente sin personales (puede tardar la carga, esperar)
  await screen.findByText(/No has subido documentos personales aún/i);

    // Subir archivo (aseguramos presencia del botón por su rol y nombre accesible)
    screen.getByRole('button', { name: /subir/i });
    // El input file está oculto; seleccionamos por type=file
    const hiddenInputs = document.querySelectorAll('input[type="file"]');
    const fileEl = hiddenInputs[0] as HTMLInputElement;
    const testFile = new File(['contenido'], 'mi_doc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileEl, { target: { files: [testFile] } });

    await waitFor(() => {
      // Después de upload debe refrescar y ya no mostrar el mensaje vacío (puede tardar un ciclo)
      expect(screen.queryByText(/No has subido documentos personales aún/)).not.toBeInTheDocument();
    });

    // El nombre mostrado es el original
    expect(screen.getByText('mi_doc.pdf')).toBeInTheDocument();
  });
});
