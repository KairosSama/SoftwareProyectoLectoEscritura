import { describe, it, expect } from 'vitest';
import { buildSeriesAndOrder, buildPdfSeries } from '../series';
import type { Assessment } from '../../../lib/mockData';

function mockAssessment(partial: Partial<Assessment>): Assessment {
  return {
    id: partial.id || Math.random().toString(36).slice(2),
    student_id: partial.student_id || 's1',
    module_id: partial.module_id || 'lectoescritura',
    stage: partial.stage ?? 1,
    created_at: partial.created_at || new Date().toISOString(),
    indicators: partial.indicators || { a_1: 'SA', a_2: 'AP' },
    notes: partial.notes || ''
  } as Assessment;
}

describe('buildSeriesAndOrder', () => {
  it('devuelve vacío si no hay evaluaciones del módulo', () => {
    const res = buildSeriesAndOrder('lectoescritura', [] as Assessment[]);
    expect(res.series.length).toBe(0);
    expect(res.orderAscIds.length).toBe(0);
  });

  it('ordena ascendente y genera series', () => {
    const newer = mockAssessment({ created_at: '2024-01-02T00:00:00Z', module_id: 'lectoescritura', indicators: { a_1: 'SA' } });
    const older = mockAssessment({ created_at: '2024-01-01T00:00:00Z', module_id: 'lectoescritura', indicators: { a_1: 'AP' } });
    // source simula lista descendente (newer primero)
    const res = buildSeriesAndOrder('lectoescritura', [newer, older]);
    expect(res.orderAscIds[0]).toBe(older.id);
    expect(res.series[0].values.length).toBe(2);
  });
});

describe('buildPdfSeries', () => {
  it('filtra por etapa y módulo y sólo ids seleccionados', () => {
    const a1 = mockAssessment({ id: 'a1', stage: 1, module_id: 'lectoescritura', created_at: '2024-01-01T00:00:00Z' });
    const a2 = mockAssessment({ id: 'a2', stage: 1, module_id: 'matematica', created_at: '2024-01-02T00:00:00Z' });
    const a3 = mockAssessment({ id: 'a3', stage: 2, module_id: 'lectoescritura', created_at: '2024-01-03T00:00:00Z' });
    const set = new Set(['a1','a3']);
    const series = buildPdfSeries(1,'lectoescritura',[a1,a2,a3], set);
    expect(series.length).toBeGreaterThan(0);
    // Sólo a1 debe entrar
    expect(series[0].values.length).toBe(1);
  });
});
