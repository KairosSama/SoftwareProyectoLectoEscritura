// This file is kept for compatibility but now uses localStorage instead of Supabase
import { 
  Student, 
  Assessment, 
  User, 
  ProgressStatus, 
  calculateProgressStatus,
  getFromStorage,
  saveToStorage,
  initializeMockData,
  mockUsers
} from './mockData';

// Initialize mock data
initializeMockData();

// Export types and functions for compatibility
export type { Student, Assessment, User, ProgressStatus };
export { calculateProgressStatus };

// Mock API functions that simulate database operations
export const mockApi = {
  getAssessmentById: async (assessmentId: string): Promise<Assessment | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const assessments = getFromStorage('assessments') || [];
    return assessments.find((a: Assessment) => a.id === assessmentId) || null;
  },
  // Students
  getStudents: async (): Promise<Student[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return getFromStorage('students') || [];
  },

  getStudent: async (id: string): Promise<Student | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const students = getFromStorage('students') || [];
    return students.find((s: Student) => s.id === id) || null;
  },

  createStudent: async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const students = getFromStorage('students') || [];
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    students.push(newStudent);
    saveToStorage('students', students);
    return newStudent;
  },

  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const students = getFromStorage('students') || [];
    const index = students.findIndex((s: Student) => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    students[index] = { ...students[index], ...studentData, updated_at: new Date().toISOString() };
    saveToStorage('students', students);
    return students[index];
  },

  // Assessments
  getAssessments: async (): Promise<Assessment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage('assessments') || [];
  },

  getAssessmentsByStudent: async (studentId: string): Promise<Assessment[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const assessments = getFromStorage('assessments') || [];
    return assessments.filter((a: Assessment) => a.student_id === studentId);
  },

  createAssessment: async (assessmentData: Omit<Assessment, 'id' | 'created_at'>): Promise<Assessment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const assessments = getFromStorage('assessments') || [];
    const newAssessment: Assessment = {
      ...assessmentData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    assessments.push(newAssessment);
    saveToStorage('assessments', assessments);
    return newAssessment;
  },

  // Users/Auth
  signIn: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple mock authentication - in real app, this would verify password
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Save current user to localStorage
    saveToStorage('currentUser', user);
    return user;
  },

  signUp: async (email: string, password: string, fullName: string, role: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getFromStorage('users') || mockUsers;
    
    // Check if user already exists
    if (users.find((u: User) => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      role: role as 'administrator' | 'teacher' | 'evaluator'
    };
    
    users.push(newUser);
    saveToStorage('users', users);
    saveToStorage('currentUser', newUser);
    
    return newUser;
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    saveToStorage('currentUser', null);
  },

  getCurrentUser: (): User | null => {
    return getFromStorage('currentUser');
  },

  resetPassword: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const users = getFromStorage('users') || mockUsers;
    const user = users.find((u: User) => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    // In a real app, this would send an email
    console.log(`Password reset email sent to ${email}`);
  }
};