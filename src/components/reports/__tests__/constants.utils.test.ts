import { describe, it, expect } from 'vitest';
import { prettyBlock, getQuestionLabel, groupIndicatorsByBlock } from '../constants';

describe('constants utils', () => {
  it('prettyBlock fallback formatea id desconocido', () => {
    expect(prettyBlock('mi_bloque_prueba')).toBe('Mi Bloque Prueba');
  });
  it('getQuestionLabel retorna pregunta por defecto', () => {
    expect(getQuestionLabel('no_existente', 2)).toBe('Pregunta 3');
  });
  it('groupIndicatorsByBlock agrupa y ordena', () => {
    const grouped = groupIndicatorsByBlock({ bloque_2: 'SA', bloque_0: 'AP', bloque_1: 'NP' } as any);
    expect(Object.keys(grouped)).toContain('bloque');
    expect(grouped.bloque.map(i=>i.idx)).toEqual([0,1,2]);
  });
  it('groupIndicatorsByBlock vacío cuando no hay indicadores', () => {
    expect(groupIndicatorsByBlock(null as any)).toEqual({});
  });
});
