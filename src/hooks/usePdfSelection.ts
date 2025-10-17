import { useState, useCallback } from 'react';
import { Assessment } from '../lib/mockData';

export function usePdfSelection(initialStage: number, assessments: Assessment[]) {
  const [pdfStages, setPdfStages] = useState<number[]>(initialStage ? [initialStage] : []);
  const [pdfSelectedIds, setPdfSelectedIds] = useState<Set<string>>(new Set(assessments.map(a=>a.id)));

  const syncAssessments = useCallback(() => {
    setPdfSelectedIds(prev => {
      const next = new Set<string>();
      assessments.forEach(a => { if (prev.has(a.id)) next.add(a.id); });
      return next.size ? next : new Set(assessments.map(a=>a.id));
    });
  }, [assessments]);

  const toggleStage = (n:number) => setPdfStages(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev, n].sort((a,b)=>a-b));
  const toggleEval = (id:string) => setPdfSelectedIds(prev => { const next = new Set(prev); next.has(id)? next.delete(id): next.add(id); return next; });
  const ensureStageIncluded = (stage:number) => setPdfStages(prev => prev.length ? prev : [stage]);

  // Nuevos setters explícitos para ajustar la selección al estado visible
  const setStagesExplicit = (stages: number[]) => setPdfStages(stages.slice().sort((a,b)=>a-b));
  const setSelectedIdsExplicit = (ids: Set<string>) => setPdfSelectedIds(new Set(ids));

  return { pdfStages, pdfSelectedIds, toggleStage, toggleEval, ensureStageIncluded, syncAssessments, setStagesExplicit, setSelectedIdsExplicit };
}
