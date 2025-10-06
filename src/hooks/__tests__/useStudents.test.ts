import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock explícito: reexportamos sólo lo necesario y sustituimos getStudents
vi.mock('../../lib/mockData', () => {
  const mockStudentsFn = vi.fn().mockResolvedValue([
    { id: 's1', full_name: 'Test Student', diagnosis: 'DX', birth_date: '2020-01-01', program_start_date: '2024-01-01', created_at: '', updated_at: '', created_by: 'u1' }
  ]);
  return {
    getStudents: mockStudentsFn
  };
});

import { useStudents } from '../useStudents';
import { getStudents } from '../../lib/mockData';

describe('useStudents', () => {
  it('retorna estudiantes después de cargar', async () => {
    const { result } = renderHook(() => useStudents());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students.length).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('maneja error de getStudents', async () => {
    (getStudents as any).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useStudents());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('boom');
    expect(result.current.students).toHaveLength(0);
  });
});
