import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotContextType {
  isOpen: boolean;
  messages: Message[];
  toggleChatbot: () => void;
  sendMessage: (text: string) => void;
  uploadDocument: (file: File) => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola profesor! Soy el asistente de evaluaciones. Puedes preguntarme sobre procedimientos, indicadores, progreso de estudiantes o subir un PDF para analizarlo.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const location = useLocation();

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Obtener estudiante activo (puedes ajustar esto según tu lógica)
    let studentId: string | null = null;
    const match = location.pathname.match(/students\/(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/);
    if (match) {
      studentId = match[1];
    }
    let pdfText = '';
    let studentData = '';
    if (studentId) {
      // Obtener texto de PDFs
      const { data: documents } = await supabase
        .from('student_documents')
        .select('extracted_text')
        .eq('student_id', studentId);
      pdfText = documents?.map(doc => doc.extracted_text).join('\n') || '';
      // Obtener datos del estudiante
      const { data: student } = await supabase
        .from('students')
        .select('full_name, diagnosis, birth_date, program_start_date')
        .eq('id', studentId)
        .single();
      if (student) {
        studentData = `Nombre: ${student.full_name}\nDiagnóstico: ${student.diagnosis}\nNacimiento: ${student.birth_date}\nInicio programa: ${student.program_start_date}`;
      }
    }

    // Preparar datos para endpoint QA
    let botText = 'No se pudo obtener respuesta.';
    let score: number | undefined = undefined;
    try {
      const response = await fetch('/api/hf-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: text,
          studentData,
          pdfText
        })
      });
      const result = await response.json();
      if (response.status === 503 && result.loading) {
        botText = result.answer || 'El modelo se está cargando, intenta nuevamente en unos segundos.';
      } else {
        botText = result.answer || botText;
        score = result.score;
      }
    } catch (err) {
      botText = 'Error al consultar el modelo de QA.';
    }

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: score !== undefined ? `${botText}\n\nConfianza: ${(score * 100).toFixed(1)}%` : botText,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botResponse]);
  };

  const uploadDocument = async (file: File) => {
    const uploadMessage: Message = {
      id: Date.now().toString(),
      text: `Documento "${file.name}" subido correctamente. Ahora puedes hacerme preguntas sobre su contenido y te responderé en español.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, uploadMessage]);
  };



  const value = {
    isOpen,
    messages,
    toggleChatbot,
    sendMessage,
    uploadDocument
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}