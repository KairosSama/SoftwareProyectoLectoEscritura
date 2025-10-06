import React, { Suspense, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import BarChartMini from './BarChartMini';
import StageTable from './StageTable';
import LoadingSpinner from '../ui/LoadingSpinner';
import { calculateProgressStatus, Assessment } from '../../lib/mockData';
import { buildPdfSeries } from './series';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: number[];
  toggleStage: (n:number)=>void;
  assessments: Assessment[];
  selectedIds: Set<string>;
  toggleEval: (id:string)=>void;
  download: () => Promise<void>;
  pdfPreviewRef: React.RefObject<HTMLDivElement>;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, onClose, stages, toggleStage, assessments, selectedIds, toggleEval, download, pdfPreviewRef }) => {
  useFocusTrap(pdfPreviewRef as React.RefObject<HTMLElement>, isOpen);
  // Cerrar con Escape para accesibilidad adicional
  const escHandler = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(()=> { if (isOpen) { document.addEventListener('keydown', escHandler); return () => document.removeEventListener('keydown', escHandler);} }, [isOpen, escHandler]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Previsualización PDF" aria-describedby="pdf-modal-desc">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl overflow-hidden" ref={pdfPreviewRef}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2"><Download className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Previsualización de PDF</h3></div>
            <button aria-label="Cerrar" className="p-2 rounded-md hover:bg-gray-100" onClick={onClose}><X className="h-5 w-5 text-gray-600" /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="space-y-4">
              <p id="pdf-modal-desc" className="sr-only">Modal de previsualización y exportación a PDF. Selecciona etapas y evaluaciones a incluir y luego pulsa Descargar PDF.</p>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-semibold mb-2">Etapas a incluir</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {[1,2,3,4,5].map(n => <label key={n} className="inline-flex items-center gap-1"><input type="checkbox" checked={stages.includes(n)} onChange={()=>toggleStage(n)} className="rounded border-gray-300" /><span>Et {n}</span></label>)}
                </div>
              </div>
              <div className="border rounded-lg p-3 max-h-64 overflow-auto">
                <div className="text-sm font-semibold mb-2">Evaluaciones</div>
                {assessments.length? <div className="space-y-2" aria-label="Lista de evaluaciones">
                  {assessments.slice().sort((a,b)=> new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).map(a => (
                    <label key={a.id} className="flex items-start gap-2 text-xs">
                      <input type="checkbox" className="mt-1 rounded border-gray-300" checked={selectedIds.has(a.id)} onChange={()=>toggleEval(a.id)} />
                      <span><span className="font-medium">{new Date(a.created_at).toLocaleString()}</span> — <span className="uppercase">{a.module_id}</span> (Et {a.stage})</span>
                    </label>
                  ))}
                </div> : <div className="text-sm text-gray-500">Sin evaluaciones.</div>}
              </div>
              <button onClick={download} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"><Download className="h-4 w-4" />Descargar PDF</button>
              <p className="text-xs text-gray-500">La exportación sólo incluye etapas y evaluaciones seleccionadas.</p>
            </div>
            <div className="lg:col-span-2" aria-label="Vista previa">
              <Suspense fallback={<div className="p-6"><LoadingSpinner label="Renderizando vista previa" /></div>}>
                <div className="space-y-4 max-h-[70vh] overflow-auto" id="pdf-preview-scroll">
                  {[...stages].sort((a,b)=> a-b).map(st => {
                    const evalsForStage = assessments.filter(a => selectedIds.has(a.id) && a.stage === st).slice().sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    const seriesLecto = buildPdfSeries(st,'lectoescritura', assessments, selectedIds);
                    const seriesMate = buildPdfSeries(st,'matematica', assessments, selectedIds);
                    return <div key={st} className="space-y-4">
                      <div className="pdf-page bg-white border rounded-md shadow-sm mx-auto" style={{ width: 794, height: 1123 }}>
                        <div className="p-6 space-y-3">
                          <div className="text-xl font-semibold">Reporte de Evaluación</div>
                          <div className="text-xs text-gray-500">Etapa: {st}</div>
                          <div className="grid gap-3">
                            <div className="border rounded-md p-2"><BarChartMini series={seriesLecto} title={`Lectoescritura — Etapa ${st}`} height={160} minWidth={730} /></div>
                            <div className="border rounded-md p-2"><BarChartMini series={seriesMate} title={`Matemática — Etapa ${st}`} height={160} minWidth={730} /></div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Evaluaciones (Etapa {st})</h4>
                            {evalsForStage.length? <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-xs"><thead className="bg-gray-50"><tr><th className="px-2 py-1 text-left">Fecha</th><th className="px-2 py-1 text-left">Mód/Et</th><th className="px-2 py-1 text-left">Comp</th><th className="px-2 py-1 text-left">Aut</th><th className="px-2 py-1 text-left">Apoyo</th></tr></thead><tbody className="divide-y divide-gray-100">{evalsForStage.map(a=>{const stat=calculateProgressStatus(a);return <tr key={a.id}><td className="px-2 py-1">{new Date(a.created_at).toLocaleDateString()}</td><td className="px-2 py-1">{a.module_id}/{a.stage}</td><td className="px-2 py-1">{stat.completionRate}%</td><td className="px-2 py-1">{stat.autonomousRate}%</td><td className="px-2 py-1">{stat.supportRate}%</td></tr>;})}</tbody></table></div>: <p className="text-xs text-gray-600">Sin evaluaciones seleccionadas.</p>}
                          </div>
                        </div>
                      </div>
                      {evalsForStage.map((a,idx)=>(<div key={a.id+idx} className="pdf-page bg-white border rounded-md shadow-sm mx-auto" style={{ width: 794, height: 1123 }}>
                        <div className="p-6 space-y-3">
                          <div className="text-sm font-semibold">Tareas y preguntas — Etapa {st}</div>
                          <div className="text-xs text-gray-600">{new Date(a.created_at).toLocaleString()} — {a.module_id.toUpperCase()}</div>
                          <StageTable assessment={a} />
                        </div>
                      </div>))}
                    </div>;
                  })}
                </div>
              </Suspense>
            </div>
          </div>
          <div className="px-4 py-3 border-t text-xs text-gray-500">La vista previa genera una portada por etapa (gráficos + tabla) y una página por evaluación con sus tareas.</div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
