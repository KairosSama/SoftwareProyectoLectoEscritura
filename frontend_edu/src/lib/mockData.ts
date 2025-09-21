// Funciones Supabase para evaluaciones
export const getAssessments = async (): Promise<Assessment[]> => {
  const { data, error } = await supabase.from('assessments').select('*');
  if (error) throw error;
  return data || [];
};

export const getAssessmentById = async (assessmentId: string): Promise<Assessment | null> => {
  const { data, error } = await supabase.from('assessments').select('*').eq('id', assessmentId).single();
  if (error) throw error;
  return data || null;
};

export const getAssessmentsByStudent = async (studentId: string): Promise<Assessment[]> => {
  // Traer evaluaciones ordenadas de más reciente a más antigua para facilitar usar la última
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createAssessment = async (assessmentData: Omit<Assessment, 'id' | 'created_at'>): Promise<Assessment> => {
  const { data, error } = await supabase.from('assessments').insert([assessmentData]).select('*').single();
  if (error) throw error;
  return data;
};
import { supabase } from './supabase';

// Funciones Supabase para estudiantes
export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase.from('students').select('*');
  if (error) throw error;
  return data || [];
};

export const getStudent = async (id: string): Promise<Student | null> => {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data || null;
};

export const createStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
  const { data, error } = await supabase.from('students').insert([studentData]).select('*').single();
  if (error) throw error;
  return data;
};

export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student> => {
  const { data, error } = await supabase.from('students').update(studentData).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
};
export interface Student {
  id: string;
  full_name: string;
  diagnosis: string;
  birth_date: string;
  program_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  student_id: string;
  module_id: string;
  stage: number;
  indicators: Record<string, 'AP' | 'SA' | 'NP'>;
  notes: string;
  evaluator_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'administrator' | 'teacher' | 'evaluator';
  fullName: string;
}

export interface ProgressStatus {
  color: 'green' | 'red' | 'white';
  completionRate: number;
  autonomousRate: number;
  supportRate: number;
}

// Mock data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@eduassess.com',
    role: 'administrator',
    fullName: 'Admin User'
  },
  {
    id: '2',
    email: 'teacher@eduassess.com',
    role: 'teacher',
    fullName: 'Sarah Johnson'
  },
  {
    id: '3',
    email: 'evaluator@eduassess.com',
    role: 'evaluator',
    fullName: 'Dr. Michael Chen'
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    full_name: 'Emma Rodriguez',
    diagnosis: 'Autism Spectrum Disorder',
    birth_date: '2015-03-15',
    program_start_date: '2023-09-01',
    created_at: '2023-09-01T10:00:00Z',
    updated_at: '2023-09-01T10:00:00Z'
  },
  {
    id: '2',
    full_name: 'Lucas Thompson',
    diagnosis: 'ADHD',
    birth_date: '2014-07-22',
    program_start_date: '2023-08-15',
    created_at: '2023-08-15T10:00:00Z',
    updated_at: '2023-08-15T10:00:00Z'
  },
  {
    id: '3',
    full_name: 'Sophia Kim',
    diagnosis: 'Learning Disability',
    birth_date: '2016-01-10',
    program_start_date: '2023-10-01',
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z'
  }
];

export const mockAssessments: Assessment[] = [
  {
    id: '1',
    student_id: '1',
    module_id: 'lectoescritura',
    stage: 1,
    indicators: {
      'reconocimiento_fotos_0': 'SA',
      'reconocimiento_fotos_1': 'AP',
      'reconocimiento_fotos_2': 'SA',
      'seleccion_conocidas_0': 'SA',
      'seleccion_conocidas_1': 'NP',
      'emparejamiento_identicas_0': 'AP',
      'emparejamiento_identicas_1': 'SA'
    },
    notes: 'Emma muestra buen progreso en reconocimiento de fotos. Necesita más apoyo con tareas de selección.',
    evaluator_id: '2',
    created_at: '2023-11-15T14:30:00Z'
  },
  {
    id: '2',
    student_id: '2',
    module_id: 'matematica',
    stage: 1,
    indicators: {
      'correspondencia_uno_a_uno_0': 'AP',
      'correspondencia_uno_a_uno_1': 'AP',
      'clasificacion_atributos_0': 'SA',
      'clasificacion_atributos_1': 'SA',
      'patrones_continuacion_0': 'SA'
    },
    notes: 'Lucas demuestra habilidades sólidas de clasificación pero requiere apoyo para correspondencia.',
    evaluator_id: '3',
    created_at: '2023-11-10T09:15:00Z'
  }
];

export const calculateProgressStatus = (assessment: Assessment): ProgressStatus => {
  const indicators = Object.values(assessment.indicators);
  const total = indicators.length;
  
  if (total === 0) {
    return { color: 'white', completionRate: 0, autonomousRate: 0, supportRate: 0 };
  }
  
  const completedCount = indicators.length; // Todos los indicadores tienen valor 'AP', 'SA' o 'NP'
  const autonomousCount = indicators.filter(val => val === 'SA').length;
  const supportCount = indicators.filter(val => val === 'AP').length;
  
  const completionRate = (completedCount / total) * 100;
  const autonomousRate = (autonomousCount / total) * 100;
  const supportRate = (supportCount / total) * 100;
  
  // Determine color based on criteria
  let color: 'green' | 'red' | 'white' = 'white';
  
  if (completionRate < 50) {
    color = 'white'; // Not passed
  } else if (autonomousRate > 60 && completionRate > 80) {
    color = 'green'; // Autonomous mastery
  } else if (supportRate > 50 && autonomousRate < 40) {
    color = 'red'; // Needs significant support
  }
  
  return {
    color,
    completionRate: Math.round(completionRate),
    autonomousRate: Math.round(autonomousRate),
    supportRate: Math.round(supportRate)
  };
};

// Local storage utilities
export const getStorageKey = (key: string) => `eduassess_${key}`;

export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(getStorageKey(key), JSON.stringify(data));
};

export const getFromStorage = (key: string) => {
  const data = localStorage.getItem(getStorageKey(key));
  return data ? JSON.parse(data) : null;
};

export const removeFromStorage = (key: string) => {
  localStorage.removeItem(getStorageKey(key));
};

// Initialize mock data in localStorage if not exists
export const initializeMockData = () => {
  if (!getFromStorage('students')) {
    saveToStorage('students', mockStudents);
  }
  if (!getFromStorage('assessments')) {
    saveToStorage('assessments', mockAssessments);
  }
  if (!getFromStorage('users')) {
    saveToStorage('users', mockUsers);
  }
};