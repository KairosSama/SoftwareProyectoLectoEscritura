import React, { createContext, useContext, useState } from 'react';

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

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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

  const generateBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('evaluación') || msg.includes('evaluar')) {
      return 'En las evaluaciones, cada indicador puede marcarse como "AP" (Con Apoyo), "SA" (Sin Apoyo) o "NP" (No logrado). Observa primero la respuesta natural del estudiante.';
    }
    if (msg.includes('etapa 1') || msg.includes('foto')) {
      return 'La etapa 1 se centra en el reconocimiento de fotos y la categorización básica. Comienza con objetos y personas familiares antes de avanzar a categorías más abstractas.';
    }
    if (msg.includes('progreso') || msg.includes('color')) {
      return 'La matriz de progreso usa: Verde para autonomía (>60% SA y >80% completado), Rojo para apoyo significativo (>50% AP y <40% SA), y Blanco para no logrado (<50% completado).';
    }
    if (msg.includes('pdf') || msg.includes('documento')) {
      return 'He recibido tu PDF. Puedes preguntarme sobre su contenido y te responderé en español.';
    }
    return 'Entiendo que tienes dudas sobre evaluación en educación especial. ¿Sobre qué aspecto necesitas ayuda? Puedo orientarte en procedimientos, indicadores, progreso o documentación. Todas mis respuestas serán en español.';
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