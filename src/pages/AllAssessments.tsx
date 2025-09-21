import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssessments, getStudents, calculateProgressStatus, Assessment, Student } from '../lib/mockData';
import { Search, Eye } from 'lucide-react';

function AllAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autonomyFilter, setAutonomyFilter] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<string>('');

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

  // Si el filtro de estudiante no corresponde a ningún estudiante, lo limpiamos
  const validStudentIds = students.map(s => s.id);
  const effectiveStudentFilter = validStudentIds.includes(studentFilter) ? studentFilter : '';

  const filteredAssessments = assessments.filter(a => {
    const student = students.find(s => s.id === a.student_id);
    const status = calculateProgressStatus(a);
    let autonomyMatch = true;
    if (autonomyFilter === 'autonomous') autonomyMatch = status.autonomousRate >= 60;
    if (autonomyFilter === 'support') autonomyMatch = status.supportRate >= 50;
    if (autonomyFilter === 'not-achieved') autonomyMatch = status.completionRate < 50;
    let studentMatch = true;
    if (effectiveStudentFilter) studentMatch = a.student_id === effectiveStudentFilter;
    let searchMatch = true;
    if (searchTerm) {
      searchMatch = (student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.module_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return autonomyMatch && studentMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todas las Evaluaciones</h1>
          <p className="text-gray-600 mt-2">Filtra por estudiante y autonomía.</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por estudiante o módulo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={studentFilter}
          onChange={e => setStudentFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 w-full md:w-1/4"
        >
          <option value="">Todos los estudiantes</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>
        <select
          value={autonomyFilter}
          onChange={e => setAutonomyFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 w-full md:w-1/4"
        >
          <option value="">Todos los estados</option>
          <option value="autonomous">Autónomo (&gt;=60%)</option>
          <option value="support">Con Apoyo (&gt;=50%)</option>
          <option value="not-achieved">No Logrado (&lt;50%)</option>
        </select>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center py-12">Cargando evaluaciones...</div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones encontradas</h3>
            <p className="text-gray-600 mb-6">Intenta buscar o cambiar los filtros.</p>
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
                        {(a.module_id === 'lectoescritura' ? 'Lectoescritura' : a.module_id === 'matematica' ? 'Matemática' : a.module_id)} • Etapa {a.stage}
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
    </div>
  );
}

export default AllAssessments;
