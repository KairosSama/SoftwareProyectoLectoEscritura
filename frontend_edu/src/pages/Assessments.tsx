import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search, Eye } from 'lucide-react';
import { getAssessments, getStudents, calculateProgressStatus } from '../lib/mockData';

import { Assessment, Student } from '../lib/mockData';
function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const a = await getAssessments();
      const s = await getStudents();
      setAssessments(a);
      setStudents(s);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredAssessments = assessments.filter(a => {
    const student = students.find(s => s.id === a.student_id);
    return (
      (student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.module_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="text-gray-600 mt-2">
            Crea y gestiona evaluaciones de estudiantes en todas las etapas de lectoescritura
          </p>
        </div>
      </div>

      {/* Assessment Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((stage) => (
          <div
            key={stage}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Etapa {stage}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {stage === 1 && 'Reconocimiento de fotos, selección, emparejamiento y categorización básica'}
              {stage === 2 && 'Categorización avanzada y secuencias temporales'}
              {stage === 3 && 'Reconocimiento de patrones complejos y secuencias lógicas'}
              {stage === 4 && 'Conceptos abstractos y habilidades avanzadas de lectoescritura'}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Bloques de evaluación: {stage === 1 ? '6' : stage === 2 ? '4' : stage === 3 ? '3' : '5'}
            </div>
          </div>
        ))}
      </div>

      {/* All Assessments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Todas las Evaluaciones</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por estudiante o módulo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">Cargando evaluaciones...</div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones encontradas</h3>
            <p className="text-gray-600 mb-6">Intenta buscar por nombre de estudiante o módulo.</p>
            <Link
              to="/students"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Seleccionar Estudiante para Evaluar</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map(a => {
              const student = students.find(s => s.id === a.student_id);
              const status = calculateProgressStatus(a);
              return (
                <div key={a.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      status.color === 'green' ? 'bg-green-500' :
                      status.color === 'red' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {student?.full_name || 'Estudiante desconocido'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {a.module_id === 'lectoescritura' ? 'Lectoescritura' : 'Matemática'} • Etapa {a.stage}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{status.completionRate}%</span>
                    <Link
                      to={`/assessments/${a.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Guidelines */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Guía de Evaluación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-blue-900">SA - Sin Apoyo</span>
            </div>
            <p className="text-blue-800 text-sm">
              El estudiante demuestra la habilidad de forma independiente sin asistencia
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-blue-900">AP - Con Apoyo</span>
            </div>
            <p className="text-blue-800 text-sm">
              El estudiante puede realizar la tarea con orientación, pistas o asistencia
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-blue-900">NP - No Logrado</span>
            </div>
            <p className="text-blue-800 text-sm">
              El estudiante no puede demostrar la habilidad incluso con apoyo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assessments;