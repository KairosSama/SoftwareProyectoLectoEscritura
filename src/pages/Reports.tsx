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
import { listGroups, getGroupWithStudents, type StudentGroup } from '../lib/groups';
import { getStorageKey } from '../lib/mockData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, MODULE_STAGE_BLOCKS, QUESTIONS } from '../components/reports/constants';
const PdfPreviewModal = lazy(()=> import('../components/reports/PdfPreviewModal'));

// Memo wrappers para reducir renders de tablas y gráficos grandes
const BarChartMini = React.memo(BarChartMiniRaw);
const StageTable = React.memo(StageTableRaw);

// Nota: el archivo legacy permanece sin renombrar como solicitaste.

// (buildSeriesAndOrder y buildPdfSeries movidos a helpers en 'series.ts')

const Reports: React.FC = () => {
  // Estado base
  const { students, loading: loadingStudents, error: studentsError } = useStudents();
  // Modo de selección: single (legacy), multi (varios estudiantes), group (por grupo)
  const [selectionMode, setSelectionMode] = useState<'single'|'multi'|'group'>('single');
  const [studentId, setStudentId] = useState<string>(''); // usado cuando single
  const [multiStudentIds, setMultiStudentIds] = useState<string[]>([]); // usado cuando multi
  const [groups, setGroups] = useState<StudentGroup[]>([]); // grupos disponibles
  const [selectedGroupId, setSelectedGroupId] = useState<string>(''); // usado cuando group
  const { assessments, loading: loadingAssessments, error: assessmentsError } = useStudentAssessments(studentId);
  // Evaluaciones múltiples (para modo multi / group) - mapa student_id -> evaluaciones
  const [multiAssessmentsMap, setMultiAssessmentsMap] = useState<Record<string, any[]>>({});
  const [loadingMultiAssessments, setLoadingMultiAssessments] = useState(false);
  const [multiError, setMultiError] = useState<string|null>(null);
  const [stage, setStage] = useState<number>(1);
  const [selectedModule, setSelectedModule] = useState<'lectoescritura'|'matematica'>('lectoescritura');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  // Nota del reporte (visible en portada PDF); persiste por contexto de selección
  const [reportNote, setReportNote] = useState('');
  const [noteLoadedKey, setNoteLoadedKey] = useState('');

  // Evitar salto lateral por aparición/desaparición del scroll (formato legacy Reports2)
  useEffect(() => {
    const el = document.documentElement as HTMLElement;
    const prev = el.style.scrollbarGutter;
    el.style.scrollbarGutter = 'stable';
    return () => { el.style.scrollbarGutter = prev; };
  }, []);

  // Selección PDF
  const { pdfStages, pdfSelectedIds, toggleEval, toggleStage, ensureStageIncluded, syncAssessments, setStagesExplicit, setSelectedIdsExplicit } = usePdfSelection(stage, assessments);
  useEffect(() => { syncAssessments(); }, [assessments, syncAssessments]);
  useEffect(() => { ensureStageIncluded(stage); }, [stage]);
  // Clave dinámica para persistir la nota según selección actual
  const buildNoteKey = () => {
    if (selectionMode === 'single') return `note_${selectedModule}_${stage}_${studentId||'none'}`;
    if (selectionMode === 'multi') return `note_${selectedModule}_${stage}_multi_${multiStudentIds.slice().sort().join('-')||'none'}`;
    if (selectionMode === 'group') return `note_${selectedModule}_${stage}_group_${selectedGroupId||'none'}`;
    return `note_${selectedModule}_${stage}_unknown`;
  };

  // Cargar nota al cambiar el contexto
  useEffect(() => {
    const key = buildNoteKey();
    if (key === noteLoadedKey) return;
    try {
      const raw = localStorage.getItem(getStorageKey(key));
      setReportNote(raw ? JSON.parse(raw) : '');
      setNoteLoadedKey(key);
    } catch {
      setReportNote('');
      setNoteLoadedKey(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode, studentId, multiStudentIds, selectedGroupId, stage, selectedModule]);

  // Guardar nota con pequeño debounce
  useEffect(() => {
    if (!noteLoadedKey) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(getStorageKey(noteLoadedKey), JSON.stringify(reportNote)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [reportNote, noteLoadedKey]);

  // Cargar grupos inicial
  useEffect(() => { (async()=> { try { const gs = await listGroups(); setGroups(gs); } catch (e) { /* silencioso */ } })(); }, []);

  // Seleccionar estudiante inicial en modo single
  useEffect(() => { if (selectionMode==='single' && students.length && !studentId) setStudentId(students[0].id); }, [students, studentId, selectionMode]);

  // Reset de selección al cambiar modo
  useEffect(() => {
    if (selectionMode === 'single') {
      setMultiStudentIds([]); setSelectedGroupId('');
    } else if (selectionMode === 'multi') {
      setSelectedGroupId('');
      // Preseleccionar primero si venimos de single
      if (studentId) setMultiStudentIds([studentId]);
    } else if (selectionMode === 'group') {
      setMultiStudentIds([]);
      if (groups.length) setSelectedGroupId(prev => prev || groups[0].id);
    }
  }, [selectionMode, studentId, groups]);

  // Cargar evaluaciones para selección múltiple / grupo
  useEffect(() => {
    const load = async () => {
      if (selectionMode === 'single') { setMultiAssessmentsMap({}); return; }
      setLoadingMultiAssessments(true); setMultiError(null);
      try {
        let ids: string[] = [];
        if (selectionMode === 'multi') ids = multiStudentIds;
        else if (selectionMode === 'group' && selectedGroupId) {
          try {
            const { studentIds } = await getGroupWithStudents(selectedGroupId);
            ids = studentIds;
          } catch (e:any) { setMultiError(e.message || 'Error cargando grupo'); }
        }
        const map: Record<string, any[]> = {};
        // Reuso de getAssessmentsByStudent dinámico import (circular evitado usando mockData directa)
        if (ids.length) {
          const mod = await import('../lib/mockData');
          await Promise.all(ids.map(async sid => {
            try { map[sid] = await mod.getAssessmentsByStudent(sid); } catch { map[sid] = []; }
          }));
        }
        setMultiAssessmentsMap(map);
      } catch (e:any) {
        setMultiError(e.message || 'Error cargando evaluaciones múltiples');
      } finally {
        setLoadingMultiAssessments(false);
      }
    };
    void load();
  }, [selectionMode, multiStudentIds, selectedGroupId]);

  // Filtrar por etapa
  const filteredByStage = useMemo(() => assessments.filter(a => a.stage === stage), [assessments, stage]);
  const filteredByStageAndModule = useMemo(
    () => filteredByStage.filter(a => a.module_id === selectedModule),
    [filteredByStage, selectedModule]
  );
  useEffect(() => { setSelectedIndex(0); }, [stage, selectedModule, assessments.length]);
  const activeAssessment = useMemo(
    () => filteredByStageAndModule[selectedIndex] ?? filteredByStageAndModule[0] ?? null,
    [filteredByStageAndModule, selectedIndex]
  );

  // Series para gráficos principales
  const lecto = useMemo(() => buildSeriesAndOrder('lectoescritura', filteredByStage, showCompletion), [filteredByStage, showCompletion]);
  const mate = useMemo(() => buildSeriesAndOrder('matematica', filteredByStage, showCompletion), [filteredByStage, showCompletion]);

  // Tooltip
  const [tip, setTip] = useState<TooltipState>({ visible: false, x: 0, y: 0 });
  const makeHoverHandlerMain = (series: { label: string; values: number[] }[], title: string) => (i: number, e: React.MouseEvent<SVGRectElement>) => {
    if (!series.length) return;
    setTip({ visible: true, x: e.clientX, y: e.clientY, title: `${title} — Eval ${i + 1}`, lines: series.map(s => ({ name: s.label, value: s.values[i] ?? 0 })) });
  };
  const hideTooltip = () => setTip(t => ({ ...t, visible: false }));
  const handleBarClick = (orderAscIds: string[]) => (i: number) => {
    const id = orderAscIds[i];
    const idx = filteredByStageAndModule.findIndex(a => a.id === id);
    if (idx !== -1) setSelectedIndex(idx);
  };

  // PDF preview + descarga
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const openPdfModal = () => {
    // Fijar etapa actual y evaluación activa del tema actual para "exportar lo que veo"
    setStagesExplicit([stage]);
    if (activeAssessment) {
      setSelectedIdsExplicit(new Set([activeAssessment.id]));
    } else {
      // fallback: todas las evals del tema/etapa visibles
      setSelectedIdsExplicit(new Set(filteredByStageAndModule.map(a=>a.id)));
    }
    setShowPdfModal(true);
  };
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

  const loading = loadingStudents || loadingAssessments || loadingMultiAssessments;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Tooltip tip={tip} />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reportes y Analíticas</h1>
          <p className="text-gray-600 mt-1">Seguimiento avanzado del progreso y exportación a PDF.</p>
        </div>
        <button onClick={openPdfModal} disabled={selectionMode==='single' ? !assessments.length : (selectionMode==='multi' ? multiStudentIds.length===0 : !selectedGroupId)} className="inline-flex items-center gap-2 bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Download className="h-4 w-4" /> PDF / Previsualizar
        </button>
      </header>

      {/* Filtros */}
      <section className="bg-white rounded-lg border p-4 space-y-4">
        {/* Modo de selección */}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="selmode" value="single" checked={selectionMode==='single'} onChange={()=>setSelectionMode('single')} />
            Un estudiante
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="selmode" value="multi" checked={selectionMode==='multi'} onChange={()=>setSelectionMode('multi')} />
            Varios estudiantes
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="selmode" value="group" checked={selectionMode==='group'} onChange={()=>setSelectionMode('group')} />
            Por grupo
          </label>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="col-span-2">
            {selectionMode === 'single' && (
              <div>
                <label htmlFor="student-select" className="text-sm text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Estudiante</label>
                <select id="student-select" className="mt-1 w-full border rounded-md px-3 py-2" value={studentId} onChange={e=>setStudentId(e.target.value)}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            )}
            {selectionMode === 'multi' && (
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><User className="h-4 w-4 text-gray-500" /> Estudiantes</div>
                <div className="max-h-40 overflow-y-auto border rounded-md px-2 py-2 space-y-1 text-sm">
                  {students.map(s => {
                    const checked = multiStudentIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={checked} onChange={() => {
                          setMultiStudentIds(prev => checked ? prev.filter(id=>id!==s.id) : [...prev, s.id]);
                        }} />
                        <span className="truncate" title={s.full_name}>{s.full_name}</span>
                      </label>
                    );
                  })}
                  {!students.length && <div className="text-gray-500 italic">Sin estudiantes</div>}
                </div>
              </div>
            )}
            {selectionMode === 'group' && (
              <div>
                <label htmlFor="group-select" className="text-sm text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Grupo</label>
                <select id="group-select" className="mt-1 w-full border rounded-md px-3 py-2" value={selectedGroupId} onChange={e=>setSelectedGroupId(e.target.value)}>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  {!groups.length && <option value="">Sin grupos</option>}
                </select>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="stage-select" className="text-sm text-gray-600">Etapa</label>
            <select id="stage-select" className="mt-1 w-full border rounded-md px-3 py-2" value={stage} onChange={e=>setStage(parseInt(e.target.value))}>
              {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="module-select" className="text-sm text-gray-600">Tema</label>
            <select id="module-select" className="mt-1 w-full border rounded-md px-3 py-2" value={selectedModule} onChange={e=>setSelectedModule(e.target.value as 'lectoescritura'|'matematica')}>
              <option value="lectoescritura">Lectoescritura</option>
              <option value="matematica">Matemática</option>
            </select>
          </div>
          <div>
            <label htmlFor="assessment-select" className="text-sm text-gray-600">Evaluación</label>
            <select id="assessment-select" className="mt-1 w-full border rounded-md px-3 py-2" value={selectedIndex} onChange={e=>setSelectedIndex(parseInt(e.target.value))} disabled={!filteredByStageAndModule.length}>
              {filteredByStageAndModule.map((a,i)=>(<option key={a.id} value={i}>{new Date(a.created_at).toLocaleString()} — {a.module_id} (Etapa {a.stage})</option>))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" checked={showCompletion} onChange={e=>setShowCompletion(e.target.checked)} />
            Mostrar “Completado” como cuarta serie
          </label>
        </div>
  <div className="text-xs text-gray-500">{loading ? <LoadingSpinner small label="Cargando datos" /> : selectionMode==='single' ? (assessments.length ? `${assessments.length} evaluaciones cargadas` : 'Sin evaluaciones para mostrar') : Object.keys(multiAssessmentsMap).length ? `${Object.keys(multiAssessmentsMap).length} estudiantes seleccionados` : (selectionMode==='multi' ? 'Selecciona estudiantes' : 'Selecciona un grupo')}</div>
        {(studentsError || assessmentsError) && <div className="text-sm text-red-600">Error: {studentsError || assessmentsError}</div>}
        {multiError && <div className="text-sm text-red-600">Error múltiple: {multiError}</div>}
        {/* Nota del reporte */}
        <div className="space-y-2">
          <label htmlFor="report-note" className="text-sm font-medium text-gray-700">Nota del reporte (espacio amplio, se incluirá en la portada del PDF)</label>
          <textarea
            id="report-note"
            value={reportNote}
            onChange={e=>setReportNote(e.target.value)}
            placeholder="Escribe observaciones detalladas, progreso, recomendaciones, acuerdos con la familia, adaptaciones didácticas, etc."
            className="w-full min-h-[180px] resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-xs text-gray-500 flex justify-between"><span>Se guarda automáticamente según la selección actual.</span><span>{reportNote.length} caracteres</span></div>
        </div>
      </section>

      {/* Gráfico(s) del tema seleccionado */}
      <section className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{selectedModule === 'lectoescritura' ? 'Lectoescritura' : 'Matemática'} — Etapa {stage}</h3>
          </div>
          {loading ? (
            <Skeleton lines={6} className="mt-2" lineClassName="w-full" />
          ) : selectionMode === 'single' ? (
            selectedModule === 'lectoescritura' ? (
              lecto.series.length ? (
                <BarChartMini
                  series={lecto.series}
                  title="Histórico"
                  onBarHover={makeHoverHandlerMain(lecto.series, 'Lectoescritura')}
                  onLeave={hideTooltip}
                  onBarClick={handleBarClick(lecto.orderAscIds)}
                />
              ) : (
                <p className="text-sm text-gray-600">No hay evaluaciones para esta etapa en Lectoescritura.</p>
              )
            ) : (
              mate.series.length ? (
                <BarChartMini
                  series={mate.series}
                  title="Histórico"
                  onBarHover={makeHoverHandlerMain(mate.series, 'Matemática')}
                  onLeave={hideTooltip}
                  onBarClick={handleBarClick(mate.orderAscIds)}
                />
              ) : (
                <p className="text-sm text-gray-600">No hay evaluaciones para esta etapa en Matemática.</p>
              )
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const selectedIds = selectionMode==='multi' ? multiStudentIds : Object.keys(multiAssessmentsMap);
                if (!selectedIds.length) return <p className="text-sm text-gray-600">Selecciona estudiantes para comparar.</p>;
                return selectedIds.map((sid) => {
                  const student = students.find(s=>s.id===sid);
                  const list = (multiAssessmentsMap[sid]||[]).filter(a=>a.stage===stage && a.module_id===selectedModule);
                  const data = buildSeriesAndOrder(selectedModule, list, showCompletion);
                  if (!data.series.length) return (
                    <div key={sid} className="border rounded p-2 text-sm text-gray-600">
                      <div className="font-semibold text-gray-800 mb-1">{student?.full_name || 'Estudiante'}</div>
                      Sin evaluaciones para esta etapa/tema.
                    </div>
                  );
                  return (
                    <div key={sid} className="border rounded">
                      <BarChartMini
                        series={data.series}
                        title={student?.full_name || 'Estudiante'}
                        onLeave={hideTooltip}
                      />
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Tabla(s) de tareas */}
      <section className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Tareas y preguntas — ({selectedModule === 'lectoescritura' ? 'Lectoescritura' : 'Matemática'} / Etapa {stage})</h3>
          </div>
          {selectionMode==='single' && activeAssessment && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={()=> setShowAllQuestions(v=>!v)}
              aria-expanded={showAllQuestions}
            >
              {showAllQuestions ? 'Ocultar preguntas del tema' : 'Mostrar preguntas del tema'}
            </button>
          )}
        </div>
        {selectionMode==='single' ? (
          activeAssessment ? (
            <>
              <StageTable assessment={activeAssessment} />
              {activeAssessment.notes && (
                <div className="mt-4 border rounded-md bg-blue-50/40 p-3">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Nota de la evaluación</div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak:'break-word' }}>{activeAssessment.notes}</p>
                </div>
              )}
            {/* Explicación de cada P del tema (dos columnas) */}
            {showAllQuestions && (() => {
              const grouped = groupIndicatorsByBlock(activeAssessment.indicators);
              // Bloques esperados por el mapeo para mantener PN consistente
              const expected = MODULE_STAGE_BLOCKS[selectedModule]?.[activeAssessment.stage] || Object.keys(grouped);
              // Construimos PN continuo igual que en StageTable (por bloque esperado y por índice)
              const pnFor: Record<string, string> = {};
              let running = 1;
              for (const blockId of expected) {
                const count = QUESTIONS[blockId]?.length ?? (grouped[blockId]?.length ?? 0);
                for (let i = 0; i < count; i++) pnFor[`${blockId}#${i}`] = `P${running++}`;
              }
              // Renderizar sólo los ítems presentes en la evaluación actual, agrupados por bloque
              return (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-gray-800 mb-2">
                    Preguntas de {selectedModule === 'lectoescritura' ? 'Lectoescritura' : 'Matemática'}
                  </div>
                  {expected.map((blockId) => {
                    const total = QUESTIONS[blockId]?.length ?? (grouped[blockId]?.length ?? 0);
                    if (!total) return null;
                    const present = new Set((grouped[blockId] || []).map(it => it.idx));
                    return (
                      <div key={blockId} className="mb-3 last:mb-0">
                        <div className="text-sm font-medium text-gray-700 mb-2" aria-hidden="true">{prettyBlock(blockId)}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                          {Array.from({ length: total }).map((_, i) => {
                            const pn = pnFor[`${blockId}#${i}`];
                            const label = getQuestionLabel(blockId, i);
                            const answered = present.has(i);
                            return (
                              <div key={`${blockId}#${i}`} className="text-sm flex gap-2">
                                <span className="inline-flex min-w-[2.25rem] justify-center rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] font-semibold">{pn}</span>
                                <span className={answered ? 'text-gray-800' : 'text-gray-500 italic'}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            </>
          ) : (
            <div className="text-sm text-gray-600">No hay evaluación cargada.</div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const selectedIds = selectionMode==='multi' ? multiStudentIds : Object.keys(multiAssessmentsMap);
              if (!selectedIds.length) return <p className="text-sm text-gray-600">Selecciona estudiantes para ver sus tablas.</p>;
              return selectedIds.map(sid => {
                const student = students.find(s=>s.id===sid);
                const list = (multiAssessmentsMap[sid]||[]).filter(a=>a.stage===stage && a.module_id===selectedModule);
                const latest = list.sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                return (
                  <div key={sid} className="border rounded-md p-2">
                    <div className="text-sm font-semibold text-gray-800 mb-2">{student?.full_name || 'Estudiante'}</div>
                    {latest ? (
                      <>
                        <StageTable assessment={latest} />
                        {latest.notes && (
                          <div className="mt-2 border rounded bg-blue-50/40 p-2">
                            <div className="text-xs font-semibold mb-1">Nota de la evaluación</div>
                            <p className="text-xs whitespace-pre-wrap leading-relaxed" style={{ wordBreak:'break-word' }}>{latest.notes}</p>
                          </div>
                        )}
                      </>
                    ) : <div className="text-sm text-gray-600">Sin evaluación en esta etapa/tema.</div>}
                  </div>
                );
              });
            })()}
          </div>
        )}
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
            includeCompletion={showCompletion}
            selectedModule={selectedModule}
            reportNote={reportNote}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Reports;