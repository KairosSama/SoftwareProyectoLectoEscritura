import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/mockData', () => {
  return {
    getAssessmentsByStudent: vi.fn().mockImplementation(async (studentId: string) => {
      if (studentId === 'error') throw new Error('fallo');
      if (studentId === 'empty') return [];
      return [
        { id: 'a1', student_id: studentId, module_id: 'lecto', stage: 1, indicators: { a: 'SA' }, notes: '', evaluator_id: 'u1', created_at: '2024-01-01', created_by: 'u1' }
      ];
    })
  };
});

import { useStudentAssessments } from '../useStudentAssessments';

describe('useStudentAssessments', () => {
  it('retorna lista cuando hay studentId', async () => {
    const { result, rerender } = renderHook(({ id }) => useStudentAssessments(id), { initialProps: { id: '' } });
    // Inicial sin id -> lista vacía y sin loading
    expect(result.current.assessments).toHaveLength(0);
    expect(result.current.loading).toBe(false);

    rerender({ id: 's1' });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.assessments).toHaveLength(1);
  });

  it('maneja error', async () => {
    const { result } = renderHook(() => useStudentAssessments('error'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('fallo');
    expect(result.current.assessments).toHaveLength(0);
  });

  it('maneja lista vacía', async () => {
    const { result } = renderHook(() => useStudentAssessments('empty'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.assessments).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
