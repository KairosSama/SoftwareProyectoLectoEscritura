import React from 'react';
import { useEffect, useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import BarChart from '../components/BarChart';
import { mockApi, Student, Assessment, calculateProgressStatus } from '../lib/supabase';
import jsPDF from 'jspdf';

function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [individualReport, setIndividualReport] = useState<Assessment[]>([]);
  const [classSummary, setClassSummary] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

  useEffect(() => {
    async function fetchData() {
      const s = await mockApi.getStudents();
      const a = await mockApi.getAssessments();
      setStudents(s);
      setAssessments(a);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      let filtered = assessments.filter(a => a.student_id === selectedStudentId);
      if (startDate) {
        filtered = filtered.filter(a => new Date(a.created_at) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter(a => new Date(a.created_at) <= new Date(endDate));
      }
      setIndividualReport(filtered);
    } else {
      setIndividualReport([]);
    }
  }, [selectedStudentId, assessments]);

  useEffect(() => {
    // Resumen de la clase: porcentaje de estudiantes autónomos, con apoyo, no logrados
    if (students.length && assessments.length) {
      let autonomous = 0, support = 0, notAchieved = 0;
      students.forEach(student => {
        const studentAssessments = assessments.filter(a => a.student_id === student.id);
        let totalIndicators = 0, sa = 0, ap = 0, np = 0;
        studentAssessments.forEach(a => {
          Object.values(a.indicators).forEach(val => {
            totalIndicators++;
            if (val === 'SA') sa++;
            else if (val === 'AP') ap++;
            else np++;
          });
        });
        if (totalIndicators > 0) {
          const saRate = (sa / totalIndicators) * 100;
          const apRate = (ap / totalIndicators) * 100;
          const npRate = (np / totalIndicators) * 100;
          if (saRate > 60) autonomous++;
          else if (apRate > 50) support++;
          else notAchieved++;
        }
      });
      setClassSummary({
        labels: ['Autónomos', 'Con Apoyo', 'No Logrado'],
        values: [
          Math.round((autonomous / students.length) * 100),
          Math.round((support / students.length) * 100),
          Math.round((notAchieved / students.length) * 100)
        ]
      });
    }
  }, [students, assessments]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Progreso Individual', 10, 10);
    if (individualReport.length) {
      individualReport.forEach((a, idx) => {
        doc.text(`Etapa: ${a.stage} | Módulo: ${a.module_id} | Fecha: ${new Date(a.created_at).toLocaleDateString('es-ES')}`, 10, 20 + idx * 10);
        doc.text(`Indicadores: ${Object.entries(a.indicators).map(([k, v]) => `${k}: ${v}`).join(', ')}`, 10, 25 + idx * 10);
        doc.text(`Notas: ${a.notes || 'Sin notas'}`, 10, 30 + idx * 10);
      });
    } else {
      doc.text('No hay evaluaciones para este estudiante.', 10, 20);
    }
    doc.save('reporte_individual.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analíticas</h1>
          <p className="text-gray-600 mt-2">
            Rastrea el progreso de los estudiantes y genera reportes completos
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Estudiantes</h3>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Activos en el programa</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Evaluaciones</h3>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completadas en total</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Progreso Promedio</h3>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{
            assessments.length > 0
              ? `${Math.round(
                  assessments.reduce((acc, a) => acc + (Object.values(a.indicators).filter(v => v === 'SA' || v === 'AP').length / Object.keys(a.indicators).length) * 100, 0) / assessments.length
                )}%`
              : '0%'
          }</p>
          <p className="text-xs text-gray-500 mt-1">En todas las etapas</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Autónomos</h3>
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{
            students.length > 0
              ? `${Math.round(
                  (students.filter(student => {
                    const studentAssessments = assessments.filter(a => a.student_id === student.id);
                    let totalIndicators = 0, sa = 0;
                    studentAssessments.forEach(a => {
                      Object.values(a.indicators).forEach(val => {
                        totalIndicators++;
                        if (val === 'SA') sa++;
                      });
                    });
                    return totalIndicators > 0 && (sa / totalIndicators) * 100 > 60;
                  }).length / students.length) * 100
                )}`
              : '0'
          }%</p>
          <p className="text-xs text-gray-500 mt-1">Estudiantes que muestran independencia</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reporte de Progreso Individual
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Análisis detallado del progreso de cada estudiante en todas las etapas de evaluación
            </p>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona estudiante:</label>
                <select
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde:</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta:</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {individualReport.length > 0 ? (
              <div className="space-y-6">
                {individualReport.map(a => (
                  <div key={a.id} className="border rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-bold text-blue-700 text-lg mb-1">Etapa {a.stage} <span className="text-xs text-gray-500">({a.module_id === 'lectoescritura' ? 'Lenguaje' : 'Matemática'})</span></div>
                      <div className="text-sm text-gray-600 mb-2">Fecha: <span className="font-medium">{new Date(a.created_at).toLocaleDateString('es-ES')}</span></div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(a.indicators).map(([k, v]) => (
                          <span key={k} className={`px-2 py-1 rounded text-xs font-semibold ${
                            v === 'SA' ? 'bg-green-100 text-green-700' :
                            v === 'AP' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {k.replace(/_/g, ' ')}: {v === 'SA' ? 'Autónomo' : v === 'AP' ? 'Con Apoyo' : 'No Logrado'}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-700"><span className="font-semibold">Notas:</span> {a.notes || 'Sin notas'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Selecciona un estudiante para ver su progreso.</div>
            )}
            <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200 mt-4 text-sm" onClick={handleExportPDF} disabled={!selectedStudentId}>
              Exportar PDF
            </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reporte Resumen de la Clase
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Resumen del desempeño de la clase y tendencias de progreso a lo largo del tiempo
            </p>
            <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border">
              <BarChart
                labels={classSummary.labels}
                values={classSummary.values}
                title="Resumen de la Clase (Porcentaje de estudiantes)"
              />
              <div className="mt-4 text-sm text-gray-700">
                <ul className="list-disc ml-6">
                  <li><span className="font-semibold text-green-700">Autónomos:</span> Estudiantes que lograron más del 60% de indicadores de forma autónoma.</li>
                  <li><span className="font-semibold text-red-700">Con Apoyo:</span> Estudiantes que requieren apoyo en más del 50% de los indicadores.</li>
                  <li><span className="font-semibold text-gray-700">No Logrado:</span> Estudiantes que no alcanzan los criterios anteriores.</li>
                </ul>
              </div>
            </div>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analíticas Avanzadas Próximamente
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Gráficos completos, seguimiento de progreso y analíticas detalladas estarán disponibles una vez que comiences a crear evaluaciones.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reports;