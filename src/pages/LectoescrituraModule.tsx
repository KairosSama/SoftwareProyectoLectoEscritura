import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, Eye } from 'lucide-react';
import { getAssessments, getStudents, calculateProgressStatus, Assessment, Student } from '../lib/mockData';

function LectoescrituraModule() {
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

  // Filtrar solo evaluaciones de lectoescritura
  const filteredAssessments = assessments
    .filter(a => a.module_id === 'lectoescritura')
    .filter(a => {
      const student = students.find(s => s.id === a.student_id);
      if (!searchTerm) return true;
      return (student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5); // solo las 5 más recientes

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Lectoescritura</h1>
          <p className="text-gray-600 mt-2">
            Evaluación del desarrollo de habilidades de lectura y escritura
          </p>
        </div>
      </div>

      {/* Assessment Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            stage: 1,
            title: 'Desarrollo Perceptivo-Discriminativo',
            description: 'Reconocimiento de fotos, selección, emparejamiento y agrupación por criterios',
            blocks: 6
          },
          {
            stage: 2,
            title: 'Percepción Global y Reconocimiento',
            description: 'Reconocimiento global de palabras, asociación tarjeta-cartel y lectura inicial',
            blocks: 6
          },
          {
            stage: 3,
            title: 'Aprendizaje y Reconocimiento de Sílabas',
            description: 'Análisis silábico, reconocimiento y lectura de palabras por sílabas',
            blocks: 6
          },
          {
            stage: 4,
            title: 'Progreso en la Lectura',
            description: 'Lectura de párrafos, comprensión y uso de vocabulario contextual',
            blocks: 6
          }
        ].map((stageInfo) => (
          <div
            key={stageInfo.stage}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Etapa {stageInfo.stage}
            </h3>
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              {stageInfo.title}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {stageInfo.description}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Bloques de evaluación: {stageInfo.blocks}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Assessments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Evaluaciones Recientes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
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
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones aún</h3>
            <p className="text-gray-600 mb-6">Las evaluaciones aparecerán aquí una vez que comiences a evaluar estudiantes</p>
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
                      <h3 className="font-medium text-gray-900">{student?.full_name || 'Estudiante desconocido'}</h3>
                      <p className="text-sm text-gray-600">Lectoescritura • Etapa {a.stage}</p>
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

export default LectoescrituraModule;