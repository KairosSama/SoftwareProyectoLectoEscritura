import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatbotProvider } from './contexts/ChatbotContext';
import Navbar from './components/layout/Navbar';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import LectoescrituraModule from './pages/LectoescrituraModule';
import MatematicaModule from './pages/MatematicaModule';
import AssessmentForm from './pages/AssessmentForm';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AssessmentDetail from './pages/AssessmentDetail';
import AllAssessments from './pages/AllAssessments';

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Dashboard />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Students />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/:id"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <StudentDetail />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lectoescritura"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <LectoescrituraModule />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matematica"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <MatematicaModule />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment/:moduleId/:studentId"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <AssessmentForm />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments/:assessmentId"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <AssessmentDetail />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Reports />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Profile />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-assessments"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <AllAssessments />
                    <ChatbotWidget />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;