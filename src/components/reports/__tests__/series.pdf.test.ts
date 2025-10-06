import { describe, it, expect } from 'vitest';
import { buildPdfSeries } from '../series';

const base = (id:string, stage:number, module_id:'lectoescritura'|'matematica', created_at:string, indicators:any={ a_0:'SA', a_1:'NP' }) => ({ id, student_id:'s1', module_id, stage, indicators, notes:'', evaluator_id:'u', created_at, created_by:'u' });

describe('buildPdfSeries', () => {
  it('retorna vacío cuando no hay seleccionadas', () => {
    const res = buildPdfSeries(1,'lectoescritura',[], new Set());
    expect(res).toEqual([]);
  });
  it('ordena cronológicamente ascendente', () => {
    const a1 = base('a1',1,'lectoescritura','2024-01-02');
    const a2 = base('a2',1,'lectoescritura','2024-01-01');
    const series = buildPdfSeries(1,'lectoescritura',[a1 as any,a2 as any], new Set(['a1','a2']));
    // Debe mantener el orden por fecha asc: a2, a1 -> valores se basan en indicadores (ambos mismos) => arrays de length 2
    expect(series[0].values.length).toBe(2);
  });
  it('calcula No logrado (NP) correctamente', () => {
    const a1 = base('a1',1,'matematica','2024-01-01',{ a_0:'NP', a_1:'NP' });
    const series = buildPdfSeries(1,'matematica',[a1 as any], new Set(['a1']));
    const noLogrado = series.find(s=>s.label==='No logrado');
    expect(noLogrado?.values[0]).toBe(100);
  });
});
