import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePdfSelection } from '../usePdfSelection';
import type { Assessment } from '../../lib/mockData';

const makeAssessments = (): Assessment[] => [
  { id: 'a1', student_id: 's1', module_id: 'lectoescritura', stage: 1, created_at: '2024-01-01', indicators: { x_1: 'SA' }, notes: '', evaluator_id: 'u1', created_by: 'u1' } as Assessment,
  { id: 'a2', student_id: 's1', module_id: 'matematica', stage: 1, created_at: '2024-01-02', indicators: { x_1: 'AP' }, notes: '', evaluator_id: 'u1', created_by: 'u1' } as Assessment,
];

describe('usePdfSelection', () => {
  it('inicializa con etapa y evaluaciones', () => {
    const { result } = renderHook(() => usePdfSelection(1, makeAssessments()));
    expect(result.current.pdfStages).toContain(1);
    expect(result.current.pdfSelectedIds.size).toBe(2);
  });

  it('toggleEval alterna ids', () => {
    const { result } = renderHook(() => usePdfSelection(1, makeAssessments()));
    act(()=> result.current.toggleEval('a1'));
    expect(result.current.pdfSelectedIds.has('a1')).toBe(false);
    act(()=> result.current.toggleEval('a1'));
    expect(result.current.pdfSelectedIds.has('a1')).toBe(true);
  });

  it('toggleStage agrega y quita', () => {
    const { result } = renderHook(() => usePdfSelection(1, makeAssessments()));
    act(()=> result.current.toggleStage(2));
    expect(result.current.pdfStages).toContain(2);
    act(()=> result.current.toggleStage(2));
    expect(result.current.pdfStages).not.toContain(2);
  });
});
