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
      text: 'Hello! I\'m here to help you with assessment questions and documentation. You can upload PDF documents for me to analyze.',
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
      text: `Document "${file.name}" uploaded successfully. I can now answer questions about its content.`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, uploadMessage]);
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('assessment') || lowercaseMessage.includes('evaluate')) {
      return 'For assessments, remember that each indicator can be marked as "AP" (With Support), "SA" (Without Support), or "NP" (Not Achieved). Focus on observing the student\'s natural responses first.';
    }
    
    if (lowercaseMessage.includes('stage 1') || lowercaseMessage.includes('photo')) {
      return 'Stage 1 focuses on photo recognition and basic categorization. Start with familiar items like family photos and personal objects before moving to more abstract categories.';
    }
    
    if (lowercaseMessage.includes('progress') || lowercaseMessage.includes('color')) {
      return 'The progress matrix uses: Green for autonomous mastery (>60% SA + >80% completion), Red for significant support needed (>50% AP + <40% SA), and White for not yet passed (<50% completion).';
    }
    
    return 'I understand you\'re asking about special education assessment. Could you be more specific about what aspect you\'d like help with? I can assist with assessment procedures, progress tracking, or documentation.';
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