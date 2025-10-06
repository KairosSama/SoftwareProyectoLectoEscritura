import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ChatbotProvider, useChatbot } from '../ChatbotContext';
import { MemoryRouter } from 'react-router-dom';

// Mock fetch para sendMessage
global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ answer: 'respuesta', score: 0.9 }) }) as any;

describe('ChatbotContext', () => {
  it('toggleChatbot y sendMessage agregan mensajes', async () => {
    const wrapper = ({ children }: any) => <MemoryRouter><ChatbotProvider>{children}</ChatbotProvider></MemoryRouter>;
    const { result } = renderHook(()=> useChatbot(), { wrapper });
    const initialLen = result.current.messages.length;
    act(()=> result.current.toggleChatbot());
    await act(async () => { result.current.sendMessage('Hola'); });
    expect(result.current.messages.length).toBe(initialLen + 2); // usuario + bot
  });
});
