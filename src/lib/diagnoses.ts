// Lista base de diagnósticos frecuentes (puedes ampliar o cargar desde BD más adelante)
export const DIAGNOSES: string[] = [
  'Trastorno del Espectro Autista',
  'TDAH',
  'Discapacidad intelectual leve',
  'Discapacidad intelectual moderada',
  'Dislexia',
  'Disgrafía',
  'Discalculia',
  'Trastorno del Lenguaje',
  'Trastorno del Aprendizaje No Verbal',
  'Altas Capacidades',
  'Trastorno de Ansiedad',
  'Depresión infantil',
  'Parálisis Cerebral',
  'Síndrome de Down',
  'Trastorno Oposicionista Desafiante',
  'Trastorno de Conducta',
  'TEL (Trastorno Específico del Lenguaje)',
  'Trastorno del Procesamiento Auditivo',
  'Trastorno de Coordinación del Desarrollo',
  'Trastorno Sensorial',
  'Discapacidad visual',
  'Discapacidad auditiva'
];

export function filterDiagnoses(query: string, limit = 8): string[] {
  const q = normalizeText(query);
  if (q.length < 2) return [];
  return DIAGNOSES
    .map(d => ({ d, score: scoreMatch(q, normalizeText(d)) }))
    .filter(o => o.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, limit)
    .map(o => o.d);
}

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9\s]/g, '');
}

// Simple scoring: +2 for prefix match, +1 for substring match, + length factor
function scoreMatch(query: string, candidate: string): number {
  const idx = candidate.indexOf(query);
  if (idx === 0) return 100 + query.length * 2; // fuerte
  if (idx > 0) return 50 - idx + query.length; // menor pero válido
  // coincidencia por palabras parciales
  const words = query.split(/\s+/).filter(Boolean);
  let tally = 0;
  for (const w of words) {
    const wi = candidate.indexOf(w);
    if (wi >= 0) tally += 10 + w.length;
  }
  return tally;
}
