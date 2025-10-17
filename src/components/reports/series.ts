import { Assessment, calculateProgressStatus } from '../../lib/mockData';

export interface BuiltSeriesResult {
  series: { label: string; values: number[] }[];
  orderAscIds: string[];
}

/**
 * Construye series históricas para un módulo dentro de una colección filtrada de evaluaciones ya de una etapa.
 * Devuelve además el orden cronológico ascendente (ids) para interacción (click / selección).
 */
export function buildSeriesAndOrder(moduleId: 'lectoescritura' | 'matematica', source: Assessment[], includeCompletion = false): BuiltSeriesResult {
  const filtered = source
    .filter(a => a.module_id === moduleId)
    .slice()
    .reverse(); // ascendente por fecha (asumiendo source viene descendente)
  if (!filtered.length) return { series: [], orderAscIds: [] };
  const autonomous = filtered.map(a => calculateProgressStatus(a).autonomousRate);
  const support = filtered.map(a => calculateProgressStatus(a).supportRate);
  const npRate = filtered.map(a => {
    const vals = Object.values(a.indicators || {});
    const total = vals.length || 1;
    const npCount = vals.filter(v => v === 'NP').length;
    return Math.round((npCount / total) * 100);
  });
  const base = [
    { label: 'Autónomo', values: autonomous },
    { label: 'Con apoyo', values: support },
    { label: 'No logrado', values: npRate }
  ];
  if (includeCompletion) {
    const completion = filtered.map(a => calculateProgressStatus(a).completionRate);
    base.unshift({ label: 'Completado', values: completion });
  }
  return { series: base, orderAscIds: filtered.map(a => a.id) };
}

/**
 * Construye series para el PDF: ordena cronológicamente ascendente las evaluaciones seleccionadas
 * por etapa y módulo.
 */
export function buildPdfSeries(stageNum: number, moduleId: 'lectoescritura' | 'matematica', assessments: Assessment[], selectedIds: Set<string>, includeCompletion = false) {
  const list = assessments
    .filter(a => selectedIds.has(a.id))
    .filter(a => a.stage === stageNum && a.module_id === moduleId)
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (!list.length) return [] as { label: string; values: number[] }[];
  const autonomous = list.map(a => calculateProgressStatus(a).autonomousRate);
  const support = list.map(a => calculateProgressStatus(a).supportRate);
  const npRate = list.map(a => {
    const vals = Object.values(a.indicators || {});
    const total = vals.length || 1;
    const npCount = vals.filter(v => v === 'NP').length;
    return Math.round((npCount / total) * 100);
  });
  const base: { label: string; values: number[] }[] = [
    { label: 'Autónomo', values: autonomous },
    { label: 'Con apoyo', values: support },
    { label: 'No logrado', values: npRate }
  ];
  if (includeCompletion) {
    const completion = list.map(a => calculateProgressStatus(a).completionRate);
    base.unshift({ label: 'Completado', values: completion });
  }
  return base;
}
