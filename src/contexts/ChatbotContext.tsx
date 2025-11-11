import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configurar el worker de PDF.js para Vite
// @ts-ignore
GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

type Message = { id: string; text: string; sender: 'user' | 'bot' };

type ChatbotContextType = {
  // UI
  isOpen: boolean;
  toggleChatbot: () => void;

  // Mensajería
  messages: Message[];
  sendMessage: (text: string, extraContext?: string[]) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;

  // Límite diario
  usageLeftToday: number;
};

export const ChatbotContext = createContext<ChatbotContextType>({} as any);

const DAILY_LIMIT = 5;
const LIMIT_KEY_PREFIX = 'gemini_chat_uses_';

const todayKey = () => {
  const d = new Date();
  return `${LIMIT_KEY_PREFIX}${d.toISOString().slice(0, 10)}`;
};

function readUsage(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(todayKey());
  const n = raw ? parseInt(raw, 10) : 0;
  return isNaN(n) ? 0 : n;
}

function increaseUsage() {
  if (typeof window === 'undefined') return;
  const n = readUsage();
  localStorage.setItem(todayKey(), String(n + 1));
}

async function extractTextFromPdf(file: File, maxPages = 40): Promise<string> {
  const arrayBuff = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuff });
  const pdf = await loadingTask.promise;
  const total = Math.min(pdf.numPages, maxPages);

  let out = '';
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = (content.items as any[]).map((it: any) => it.str ?? '').join(' ');
    out += `\n\n[PDF pág ${i}]\n${text}`;
  }
  return out.trim();
}

export const ChatbotProvider: React.FC<{
  children: React.ReactNode;
  studentMeta?: any;
  baseContext?: string[];
}> = ({ children, studentMeta = {}, baseContext = [] }) => {
  // UI open/close
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggleChatbot = useCallback(() => setIsOpen(v => !v), []);

  // Mensajes
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        '¡Hola profesor! Soy el asistente con Gemini. ' +
        'Puedo responder sobre los PDFs integrados y los que subas. ' +
        'Límite: 5 consultas por día.',
    },
  ]);

  // Límite
  const [uploadedContextText, setUploadedContextText] = useState<string>('');
  const [usageLeftToday, setUsageLeftToday] = useState<number>(
    Math.max(DAILY_LIMIT - readUsage(), 0)
  );

  const appendMessage = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const uploadDocument = useCallback(
    async (file: File) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

      let extracted = '';
      if (isPdf) {
        extracted = await extractTextFromPdf(file, 40);
      } else if (isTxt) {
        extracted = await file.text();
      } else {
        appendMessage({
          id: uuid(),
          sender: 'bot',
          text: 'Formato no soportado (solo PDF o TXT).',
        });
        return;
      }

      const newChunk = `\n\n[Documento subido: ${file.name}]\n${extracted}`;
      setUploadedContextText((prev) => (prev + newChunk).slice(0, 30000));
      appendMessage({
        id: uuid(),
        sender: 'bot',
        text: `Documento "${file.name}" agregado al contexto del chat.`,
      });
    },
    [appendMessage]
  );

  const sendMessage = useCallback(
    async (text: string, extraContext: string[] = []) => {
      if (!text?.trim()) return;

      const used = readUsage();
      if (used >= DAILY_LIMIT) {
        appendMessage({
          id: uuid(),
          sender: 'bot',
          text: `Alcanzaste el límite diario de ${DAILY_LIMIT} consultas. Vuelve a intentar mañana.`,
        });
        return;
      }

      const userMsg: Message = { id: uuid(), sender: 'user', text };
      appendMessage(userMsg);

      const contextChunks = [
        ...(baseContext || []),
        uploadedContextText || '',
        ...(extraContext || []),
      ].filter(Boolean);

      try {
        const r = await fetch('/api/gemini-qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text,
            contextChunks,
            studentMeta,
          }),
        });

        if (!r.ok) {
          const errText = await r.text();
          appendMessage({
            id: uuid(),
            sender: 'bot',
            text: `Error al consultar el modelo: ${errText}`,
          });
          return;
        }

        const data = await r.json();
        const answer = data?.answer || 'No obtuve respuesta del modelo.';

        increaseUsage();
        setUsageLeftToday(Math.max(DAILY_LIMIT - readUsage(), 0));

        appendMessage({ id: uuid(), sender: 'bot', text: answer });
      } catch (e: any) {
        appendMessage({
          id: uuid(),
          sender: 'bot',
          text: `Error de red o servidor: ${e?.message ?? e}`,
        });
      }
    },
    [appendMessage, baseContext, uploadedContextText, studentMeta]
  );

  const value = useMemo(
    () => ({
      isOpen,
      toggleChatbot,
      messages,
      sendMessage,
      uploadDocument,
      usageLeftToday
    }),
    [isOpen, toggleChatbot, messages, sendMessage, uploadDocument, usageLeftToday]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
};

// Hook seguro (no lanza error si el Provider no está montado)
export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context || !context.sendMessage) {
    return {
      isOpen: true,
      toggleChatbot: () => console.warn('useChatbot(): Provider no montado; toggleChatbot() ignorado'),
      messages: [],
      sendMessage: async () => console.warn('useChatbot(): Provider no montado; sendMessage() ignorado'),
      uploadDocument: async () => console.warn('useChatbot(): Provider no montado; uploadDocument() ignorado'),
      usageLeftToday: 0,
    };
  }
  return context;
};

export default ChatbotProvider;
