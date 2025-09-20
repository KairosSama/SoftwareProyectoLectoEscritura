import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockApi, Student, Assessment, calculateProgressStatus } from '../lib/supabase';
import { Calendar, FileText, Plus, Eye, Edit } from 'lucide-react';
import StudentModal from '../components/students/StudentModal';

function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAssessmentTypeModal, setShowAssessmentTypeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const fetchStudentData = async () => {
    if (!id) return;

    try {
      const studentData = await mockApi.getStudent(id);
      const assessmentsData = await mockApi.getAssessmentsByStudent(id);
      
      setStudent(studentData);
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Agrupar evaluaciones por módulo
  const getModuleAssessments = (moduleId: string, stage: number) => {
    return assessments.filter(a => a.module_id === moduleId && a.stage === stage);
  };

  const renderProgressMatrix = () => {
    const modules = [
      { id: 'lectoescritura', label: 'Lectoescritura' },
      { id: 'matematica', label: 'Matemática' }
    ];
    const stages = [1, 2, 3, 4];
    return (
      <div className="space-y-8">
        {modules.map(module => (
          <div key={module.id}>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">{module.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stages.map(stage => {
                const stageAssessments = getModuleAssessments(module.id, stage);
                const latestAssessment = stageAssessments[0];
                let status: { color: 'white' | 'green' | 'red'; completionRate: number } = { color: 'white', completionRate: 0 };
                if (latestAssessment) {
                  status = calculateProgressStatus(latestAssessment) as { color: 'white' | 'green' | 'red'; completionRate: number };
                }

                return (
                  <div
                    key={stage}
                    className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                      status.color === 'green'
                        ? 'bg-green-100 border-green-300'
                        : status.color === 'red'
                        ? 'bg-red-100 border-red-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">Etapa {stage}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {stageAssessments.length} evaluación{stageAssessments.length !== 1 ? 'es' : ''}
                    </p>
                    {latestAssessment && (
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Progreso: {status.completionRate}%</p>
                        <p>Última: {formatDate(latestAssessment.created_at)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Estudiante no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Student Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {student.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.full_name}</h1>
              <p className="text-gray-600 text-lg">{student.diagnosis}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAssessmentTypeModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Evaluación</span>
            </button>
      {/* Modal de selección de tipo de evaluación */}
      {showAssessmentTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Selecciona el tipo de evaluación</h2>
            <div className="flex flex-col space-y-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={() => {
                  setShowAssessmentTypeModal(false);
                  window.location.href = `/assessment/lectoescritura/${student?.id}`;
                }}
              >
                Lectoescritura
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => {
                  setShowAssessmentTypeModal(false);
                  window.location.href = `/assessment/matematica/${student?.id}`;
                }}
              >
                Matemática
              </button>
              <button
                className="mt-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAssessmentTypeModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Edad: {calculateAge(student.birth_date)} años</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Nacimiento: {formatDate(student.birth_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Inicio: {formatDate(student.program_start_date)}</span>
          </div>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Matriz de Progreso</h2>
          <div className="flex items-center space-x-4 text-sm">
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
        </div>
        
        {renderProgressMatrix()}
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-6">Historial de Evaluaciones</h2>
        
        {assessments.length > 0 ? (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const status = calculateProgressStatus(assessment);
              return (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      status.color === 'green' ? 'bg-green-500' :
                      status.color === 'red' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Etapa {assessment.stage} Evaluación
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(assessment.created_at)} • {status.completionRate}% completado
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {status.autonomousRate}% autónomo
                    </span>
                    <Link
                      to={`/assessments/${assessment.id}`}
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
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay evaluaciones aún
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando la primera evaluación para {student.full_name}
              </p>
              <Link
                to={`/assessments/new/${student.id}`}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Evaluación</span>
              </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchStudentData();
        }}
        student={student}
      />
    </div>
  );
}

export default StudentDetail;