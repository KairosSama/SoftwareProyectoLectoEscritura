// Mapeo de nombres de materias
const MODULE_NAMES: Record<string, string> = {
  lectoescritura: 'Lectoescritura',
  matematica: 'Matemática',
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStudents, getAssessments, Student, Assessment, calculateProgressStatus } from '../lib/mockData';
import { Users, ClipboardList, BarChart3, TrendingUp, Plus } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalAssessments: number;
  recentAssessments: number;
  averageProgress: number;
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalAssessments: 0,
    recentAssessments: 0,
    averageProgress: 0
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [recentAssessmentsList, setRecentAssessmentsList] = useState<(Assessment & { student_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
  const students = await getStudents();
  const assessments = await getAssessments();
      // Aseguramos orden: más recientes primero
      const assessmentsSorted = assessments
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Calculate stats
      const totalStudents = students.length;
      const totalAssessments = assessments.length;
      
      // Recent assessments (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const recentAssessments = assessments.filter(
        a => new Date(a.created_at) >= lastWeek
      ).length;

      // Calculate average progress
      let totalProgress = 0;
      assessments.forEach(assessment => {
        const status = calculateProgressStatus(assessment);
        totalProgress += status.completionRate;
      });
      const averageProgress = totalAssessments > 0 ? totalProgress / totalAssessments : 0;

      setStats({
        totalStudents,
        totalAssessments,
        recentAssessments,
        averageProgress: Math.round(averageProgress)
      });

      setRecentStudents(students.slice(0, 5));
      
      // Get student names for assessments
      const assessmentsWithNames = assessmentsSorted.slice(0, 5).map(assessment => {
        const student = students.find(s => s.id === assessment.student_id);
        return {
          ...assessment,
          student_name: student?.full_name || 'Unknown'
        };
      });
      setRecentAssessmentsList(assessmentsWithNames);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido de nuevo, {user?.user_metadata?.fullName || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Aquí tienes un resumen de tu plataforma de evaluación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Estudiantes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Evaluaciones</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssessments}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recientes (7 días)</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentAssessments}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/students"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Agregar Estudiante</span>
          </Link>
          
          <Link
            to="/students"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200"
          >
            <ClipboardList className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Iniciar Evaluación</span>
          </Link>
          
          <Link
            to="/reports"
            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200"
          >
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Ver Reportes</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Estudiantes Recientes</h2>
            <Link to="/students" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div>
                    <p className="font-medium text-gray-900">{student.full_name}</p>
                    <p className="text-sm text-gray-600">{student.diagnosis}</p>
                  </div>
                    <Link
                      to={`/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver
                    </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aún no hay estudiantes</p>
            )}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Evaluaciones Recientes</h2>
            <Link to="/all-assessments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todas
            </Link>
          </div>
          <div className="space-y-4">
            {recentAssessmentsList.length > 0 ? (
              recentAssessmentsList.map((assessment) => {
                const status = calculateProgressStatus(assessment);
                return (
                  <div key={assessment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="font-medium text-gray-900">{assessment.student_name}</p>
                      <p className="text-sm text-gray-600">
                        {MODULE_NAMES[assessment.module_id] || assessment.module_id} • Etapa {assessment.stage} Evaluación
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status.color === 'green' ? 'bg-green-500' :
                        status.color === 'red' ? 'bg-red-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm text-gray-600">{status.completionRate}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Aún no hay evaluaciones</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;