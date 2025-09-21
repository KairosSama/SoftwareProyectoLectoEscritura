import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, createAssessment, Student } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';
import { getStageBlocks } from '../lib/assessmentData';
import { Save, ArrowLeft } from 'lucide-react';

function AssessmentForm() {
  const { moduleId, studentId } = useParams<{ moduleId: string; studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [currentBlocks, setCurrentBlocks] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, 'AP' | 'SA' | 'NP' | ''>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (studentId && moduleId) {
      fetchStudent();
      loadStageBlocks();
    }
  }, [studentId, moduleId, currentStage]);

  const loadStageBlocks = () => {
    if (moduleId) {
      const blocks = getStageBlocks(moduleId, currentStage);
      setCurrentBlocks(blocks);
    }
  };

  const fetchStudent = async () => {
    if (!studentId) return;

    try {
  const data = await getStudent(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (blockId: string, indicatorIndex: number, value: 'AP' | 'SA' | 'NP' | '') => {
    const key = `${blockId}_${indicatorIndex}`;
    setResponses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!studentId || !user || !moduleId) return;

    setSaving(true);
    try {
      // Filtrar solo respuestas válidas
      const validIndicators = Object.fromEntries(
        Object.entries(responses).filter(([, value]) => value === 'AP' || value === 'SA' || value === 'NP')
      ) as Record<string, 'AP' | 'SA' | 'NP'>;
      const assessmentData = {
        student_id: studentId,
        module_id: moduleId as string,
        stage: currentStage,
        indicators: validIndicators,
        notes,
        evaluator_id: user.id
      };

  await createAssessment(assessmentData);

      navigate(`/students/${studentId}`);
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Error al guardar la evaluación. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const getCompletionStats = () => {
    const totalIndicators = currentBlocks.reduce((total, block) => total + block.indicators.length, 0);
    const completedCount = Object.values(responses).filter(value => value !== '').length;
    const autonomousCount = Object.values(responses).filter(value => value === 'SA').length;
    const supportCount = Object.values(responses).filter(value => value === 'AP').length;
    
    return {
      completed: completedCount,
      total: totalIndicators,
      completionRate: Math.round((completedCount / totalIndicators) * 100),
      autonomousRate: Math.round((autonomousCount / totalIndicators) * 100),
      supportRate: Math.round((supportCount / totalIndicators) * 100)
    };
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Estudiante no encontrado</h1>
          <p className="text-gray-600 mt-2">Verifica que el estudiante exista y que el ID sea correcto.</p>
        </div>
      </div>
    );
  }

  if (!currentBlocks || currentBlocks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No hay bloques de evaluación definidos</h1>
          <p className="text-gray-600 mt-2">No se encontraron bloques para el módulo <b>{moduleId}</b> y etapa <b>{currentStage}</b>. Verifica la configuración de bloques en assessmentData.</p>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();
  const moduleNames = {
    lectoescritura: 'Lectoescritura',
    matematica: 'Matemática Funcional'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/students/${studentId}`)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Evaluación Etapa {currentStage} - {moduleNames[moduleId as keyof typeof moduleNames]}
            </h1>
            <p className="text-gray-600 mt-1">
              Evaluando: {student.full_name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-600">
            <p>{stats.completed}/{stats.total} completado ({stats.completionRate}%)</p>
            <p>{stats.autonomousRate}% autónomo • {stats.supportRate}% con apoyo</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Etapa:</label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {moduleId === 'matematica' ? (
                [1, 2, 3, 4, 5].map(stage => (
                  <option key={stage} value={stage}>Etapa {stage}</option>
                ))
              ) : (
                [1, 2, 3, 4].map(stage => (
                  <option key={stage} value={stage}>Etapa {stage}</option>
                ))
              )}
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || stats.completed === 0}
            className={`text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 ${
              moduleId === 'matematica' ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Evaluación'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-600">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              moduleId === 'matematica' ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Assessment Blocks */}
      <div className="space-y-8">
        {currentBlocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {block.title}
            </h2>
            
            <div className="space-y-4">
              {block.indicators.map((indicator: string, index: number) => {
                const key = `${block.id}_${index}`;
                const currentValue = responses[key] || '';
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-800 font-medium">{indicator}</p>
                      <div className="flex space-x-2">
                        {[
                          { value: 'SA', label: 'SA', color: 'bg-green-100 text-green-800 border-green-300' },
                          { value: 'AP', label: 'AP', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                          { value: 'NP', label: 'NP', color: 'bg-red-100 text-red-800 border-red-300' }
                        ].map(({ value, label, color }) => (
                          <button
                            key={value}
                            onClick={() => handleResponseChange(block.id, index, value as 'AP' | 'SA' | 'NP')}
                            className={`px-3 py-1 rounded border-2 text-sm font-medium transition-all duration-200 ${
                              currentValue === value
                                ? color
                                : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                        {currentValue && (
                          <button
                            onClick={() => handleResponseChange(block.id, index, '')}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agregue cualquier observación, comportamiento o comentario adicional sobre esta evaluación..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving || stats.completed === 0}
          className={`text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 ${
            moduleId === 'matematica' ? 'bg-green-600' : 'bg-blue-600'
          }`}
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Guardando Evaluación...' : 'Guardar Evaluación'}</span>
        </button>
      </div>
    </div>
  );
}

export default AssessmentForm;