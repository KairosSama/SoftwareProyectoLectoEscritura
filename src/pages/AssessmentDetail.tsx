import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockApi, Assessment, Student } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

function AssessmentDetail() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const a = await mockApi.getAssessmentById(assessmentId!);
      setAssessment(a);
      if (a) {
        const s = await mockApi.getStudent(a.student_id);
        setStudent(s);
      }
    } catch (error) {
      console.error('Error al obtener la evaluación:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!assessment || !student) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Evaluación no encontrada</h1>
        <Link to={`/students/${assessment?.student_id || ''}`} className="mt-4 inline-block text-blue-600 hover:underline">Volver al perfil</Link>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Detalle de Evaluación</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{student.full_name}</h2>
        <p className="text-gray-600 mb-2">Diagnóstico: {student.diagnosis}</p>
        <p className="text-gray-600 mb-2">Módulo: {assessment.module_id === 'lectoescritura' ? 'Lenguaje (Lectoescritura)' : 'Matemática'}</p>
        <p className="text-gray-600 mb-2">Etapa: {assessment.stage}</p>
        <p className="text-gray-600 mb-2">Fecha: {new Date(assessment.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Autónomo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Con Apoyo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>No Logrado</span>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Indicadores</h3>
          <ul className="space-y-2">
            {Object.entries(assessment.indicators).map(([key, value]) => (
              <li key={key} className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{key.replace(/_/g, ' ')}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  value === 'SA' ? 'bg-green-100 text-green-700' :
                  value === 'AP' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {value === 'SA' ? 'Autónomo' : value === 'AP' ? 'Con Apoyo' : 'No Logrado'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Notas del Evaluador</h3>
          <p className="text-gray-700">{assessment.notes || 'Sin notas adicionales.'}</p>
        </div>
      </div>
    </div>
  );
}

export default AssessmentDetail;
