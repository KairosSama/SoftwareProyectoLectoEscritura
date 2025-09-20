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

  const getStageAssessments = (stage: number) => {
    return assessments.filter(a => a.stage === stage);
  };

  const renderProgressMatrix = () => {
    const stages = [1, 2, 3, 4];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(stage => {
          const stageAssessments = getStageAssessments(stage);
          const latestAssessment = stageAssessments[0];
          let status = { color: 'white' as const, completionRate: 0 };
          
          if (latestAssessment) {
            status = calculateProgressStatus(latestAssessment);
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
              <h3 className="font-semibold text-gray-900 mb-2">Stage {stage}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {stageAssessments.length} assessment{stageAssessments.length !== 1 ? 's' : ''}
              </p>
              
              {latestAssessment && (
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Progress: {status.completionRate}%</p>
                  <p>Last: {formatDate(latestAssessment.created_at)}</p>
                </div>
              )}
              
              <div className="mt-3 space-x-2">
                <Link
                  to={`/assessments/new/${id}?stage=${stage}`}
                  className="inline-flex items-center space-x-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </Link>
                {stageAssessments.length > 0 && (
                  <button className="text-xs text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
          <h1 className="text-2xl font-bold text-gray-900">Student not found</h1>
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
            <Link
              to={`/assessments/new/${student.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Assessment</span>
            </Link>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Age: {calculateAge(student.birth_date)} years old</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Born: {formatDate(student.birth_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Started: {formatDate(student.program_start_date)}</span>
          </div>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Progress Matrix</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Autonomous</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Needs Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Not Passed</span>
            </div>
          </div>
        </div>
        
        {renderProgressMatrix()}
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment History</h2>
        
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
                        Stage {assessment.stage} Assessment
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(assessment.created_at)} • {status.completionRate}% completed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {status.autonomousRate}% autonomous
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating the first assessment for {student.full_name}
            </p>
            <Link
              to={`/assessments/new/${student.id}`}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assessment</span>
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