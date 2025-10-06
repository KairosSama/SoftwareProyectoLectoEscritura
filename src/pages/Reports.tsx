import React, { useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react';
import { BarChart3, Download, Table, User } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useStudentAssessments } from '../hooks/useStudentAssessments';
import { usePdfSelection } from '../hooks/usePdfSelection';
import { calculateProgressStatus } from '../lib/mockData';
import BarChartMiniRaw from '../components/reports/BarChartMini';
import StageTableRaw from '../components/reports/StageTable';
import Tooltip from '../components/reports/Tooltip';
import Legend from '../components/reports/Legend';
import { TooltipState } from '../components/reports/types';
import { buildSeriesAndOrder } from '../components/reports/series';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';
const PdfPreviewModal = lazy(()=> import('../components/reports/PdfPreviewModal'));

// Memo wrappers para reducir renders de tablas y gráficos grandes
const BarChartMini = React.memo(BarChartMiniRaw);
const StageTable = React.memo(StageTableRaw);

// Nota: el archivo legacy permanece sin renombrar como solicitaste.

// (buildSeriesAndOrder y buildPdfSeries movidos a helpers en 'series.ts')

const Reports: React.FC = () => {
  // Estado base
  const { students, loading: loadingStudents, error: studentsError } = useStudents();
  const [studentId, setStudentId] = useState<string>('');
  const { assessments, loading: loadingAssessments, error: assessmentsError } = useStudentAssessments(studentId);
  const [stage, setStage] = useState<number>(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Selección PDF
  const { pdfStages, pdfSelectedIds, toggleEval, toggleStage, ensureStageIncluded, syncAssessments } = usePdfSelection(stage, assessments);
  useEffect(() => { syncAssessments(); }, [assessments, syncAssessments]);
  useEffect(() => { ensureStageIncluded(stage); }, [stage]);

  // Seleccionar estudiante inicial
  useEffect(() => { if (students.length && !studentId) setStudentId(students[0].id); }, [students, studentId]);

  // Filtrar por etapa
  const filteredByStage = useMemo(() => assessments.filter(a => a.stage === stage), [assessments, stage]);
  useEffect(() => { setSelectedIndex(0); }, [stage, assessments.length]);
  const activeAssessment = useMemo(() => filteredByStage[selectedIndex] ?? filteredByStage[0] ?? null, [filteredByStage, selectedIndex]);

  // Series para gráficos principales
  const lecto = useMemo(() => buildSeriesAndOrder('lectoescritura', filteredByStage), [filteredByStage]);
  const mate = useMemo(() => buildSeriesAndOrder('matematica', filteredByStage), [filteredByStage]);

  // Tooltip
  const [tip, setTip] = useState<TooltipState>({ visible: false, x: 0, y: 0 });
  const makeHoverHandlerMain = (series: { label: string; values: number[] }[], title: string) => (i: number, e: React.MouseEvent<SVGRectElement>) => {
    if (!series.length) return;
    setTip({ visible: true, x: e.clientX, y: e.clientY, title: `${title} — Eval ${i + 1}`, lines: series.map(s => ({ name: s.label, value: s.values[i] ?? 0 })) });
  };
  const hideTooltip = () => setTip(t => ({ ...t, visible: false }));
  const handleBarClick = (orderAscIds: string[]) => (i: number) => {
    const id = orderAscIds[i];
    const idx = filteredByStage.findIndex(a => a.id === id);
    if (idx !== -1) setSelectedIndex(idx);
  };

  // PDF preview + descarga
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const openPdfModal = () => { ensureStageIncluded(stage); setShowPdfModal(true); };
  const closePdfModal = () => setShowPdfModal(false);

  // buildPdfSeries ahora importada

  const downloadFromPreview = async () => {
    if (!pdfPreviewRef.current) return;
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    const root = pdfPreviewRef.current;
    const pages = Array.from(root.querySelectorAll<HTMLElement>('.pdf-page'));
    const pdf = new jsPDF('p','pt','a4');
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin*2;
    const usableHeight = pageHeight - margin*2;
    let first = true;
    for (const page of pages) {
      const canvas = await html2canvas(page, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const s = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
      const imgW = canvas.width * s; const imgH = canvas.height * s;
      const imgData = canvas.toDataURL('image/png');
      if (!first) pdf.addPage(); first = false;
      const x = margin + Math.max(0, (usableWidth - imgW)/2);
      const y = margin + Math.max(0, (usableHeight - imgH)/2);
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);
    }
    pdf.save('reporte.pdf');
  };

  // Derivar resumen de clase (sólo para conservar info del legacy en futuro, simplificado)
  const classSummary = useMemo(() => {
    if (!students.length || !assessments.length) return { labels: ['Autónomos','Con Apoyo','No Logrado'], values: [0,0,0] };
    let autonomous = 0, support = 0, notAchieved = 0;
    students.forEach(st => {
      const list = assessments.filter(a => a.student_id === st.id);
      let total=0, sa=0, ap=0; 
      list.forEach(a => { 
        Object.values(a.indicators||{}).forEach(v=>{ 
          total++; 
          if (v==='SA') sa++; 
          else if (v==='AP') ap++; 
        }); 
      });
      if (total>0) { 
        const saRate=(sa/total)*100; 
        const apRate=(ap/total)*100; 
        if (saRate>60) autonomous++; 
        else if (apRate>50) support++; 
        else notAchieved++; 
      }
    });
    return { labels: ['Autónomos','Con Apoyo','No Logrado'], values: [
      Math.round((autonomous / students.length)*100),
      Math.round((support / students.length)*100),
      Math.round((notAchieved / students.length)*100)
    ] };
  }, [students, assessments]);

  const loading = loadingStudents || loadingAssessments;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Tooltip tip={tip} />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reportes y Analíticas</h1>
          <p className="text-gray-600 mt-1">Seguimiento avanzado del progreso y exportación a PDF.</p>
        </div>
        <button onClick={openPdfModal} disabled={!assessments.length} className="inline-flex items-center gap-2 bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Download className="h-4 w-4" /> PDF / Previsualizar
        </button>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-lg border p-4 space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label htmlFor="student-select" className="text-sm text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Estudiante</label>
            <select id="student-select" className="mt-1 w-full border rounded-md px-3 py-2" value={studentId} onChange={e=>setStudentId(e.target.value)}>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stage-select" className="text-sm text-gray-600">Etapa</label>
            <select id="stage-select" className="mt-1 w-full border rounded-md px-3 py-2" value={stage} onChange={e=>setStage(parseInt(e.target.value))}>
              {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="assessment-select" className="text-sm text-gray-600">Evaluación</label>
            <select id="assessment-select" className="mt-1 w-full border rounded-md px-3 py-2" value={selectedIndex} onChange={e=>setSelectedIndex(parseInt(e.target.value))} disabled={!filteredByStage.length}>
              {filteredByStage.map((a,i)=>(<option key={a.id} value={i}>{new Date(a.created_at).toLocaleString()} — {a.module_id} (Etapa {a.stage})</option>))}
            </select>
          </div>
        </div>
  <div className="text-xs text-gray-500">{loading ? <LoadingSpinner small label="Cargando datos" /> : assessments.length ? `${assessments.length} evaluaciones cargadas` : 'Sin evaluaciones para mostrar.'}</div>
        {(studentsError || assessmentsError) && <div className="text-sm text-red-600">Error: {studentsError || assessmentsError}</div>}
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Lectoescritura — Etapa {stage}</h3></div>
          {loading ? <Skeleton lines={6} className="mt-2" lineClassName="w-full" /> : lecto.series.length ? <BarChartMini series={lecto.series} title="Histórico" onBarHover={makeHoverHandlerMain(lecto.series, 'Lectoescritura')} onLeave={hideTooltip} onBarClick={handleBarClick(lecto.orderAscIds)} /> : <p className="text-sm text-gray-600">Sin datos.</p>}
        </div>
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Matemática — Etapa {stage}</h3></div>
          {loading ? <Skeleton lines={6} className="mt-2" lineClassName="w-full" /> : mate.series.length ? <BarChartMini series={mate.series} title="Histórico" onBarHover={makeHoverHandlerMain(mate.series, 'Matemática')} onLeave={hideTooltip} onBarClick={handleBarClick(mate.orderAscIds)} /> : <p className="text-sm text-gray-600">Sin datos.</p>}
        </div>
      </section>

      {/* Tabla de tareas */}
      <section className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3"><Table className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Tareas y preguntas — (Eval seleccionada / Etapa {activeAssessment?.stage ?? stage})</h3></div>
        {activeAssessment ? <StageTable assessment={activeAssessment} /> : <div className="text-sm text-gray-600">No hay evaluación cargada.</div>}
      </section>

      {/* Resumen evaluaciones */}
      <section className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Evaluaciones del estudiante (Etapa {stage})</h3>
        {filteredByStage.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Fecha</th><th className="px-4 py-2 text-left">Módulo/Etapa</th><th className="px-4 py-2 text-left">Completado</th><th className="px-4 py-2 text-left">Autónomo</th><th className="px-4 py-2 text-left">Con apoyo</th><th className="px-4 py-2 text-left">Notas</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredByStage.slice().reverse().map(a => {
                  const stat = calculateProgressStatus(a);
                  return <tr key={a.id}><td className="px-4 py-2">{new Date(a.created_at).toLocaleString()}</td><td className="px-4 py-2">{a.module_id} / {a.stage}</td><td className="px-4 py-2">{stat.completionRate}%</td><td className="px-4 py-2">{stat.autonomousRate}%</td><td className="px-4 py-2">{stat.supportRate}%</td><td className="px-4 py-2 max-w-md text-gray-700">{a.notes}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-600">No hay evaluaciones registradas para esta etapa.</p>}
      </section>

      {/* Resumen de clase (simple) */}
      <section className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Resumen de la Clase</h3>
        <div className="flex flex-wrap gap-4 items-center">
          {classSummary.labels.map((l,i)=>(
            <div key={l} className="flex flex-col items-center text-sm">
              <span className="font-medium text-gray-700">{l}</span>
              <span className="text-blue-600 font-semibold">{classSummary.values[i]}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3"><Legend /></div>
      </section>

      {/* Modal PDF */}
      {showPdfModal && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/30"><LoadingSpinner label="Cargando modal" /></div>}>
          <PdfPreviewModal
            isOpen={showPdfModal}
            onClose={closePdfModal}
            stages={pdfStages}
            toggleStage={toggleStage}
            assessments={assessments}
            selectedIds={pdfSelectedIds}
            toggleEval={toggleEval}
            download={downloadFromPreview}
            pdfPreviewRef={pdfPreviewRef}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Reports;