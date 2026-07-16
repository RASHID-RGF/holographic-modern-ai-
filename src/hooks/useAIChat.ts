'use client';

import { useState, useCallback } from 'react';
import type { Message, UploadedFile } from '@/types';

export async function getApiResponse(content: string, files: UploadedFile[] = []): Promise<string> {
  try {
    const response = await fetch('/api/nova-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, files }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof data?.content === 'string' && data.content.trim()) {
        return data.content;
      }
    }

    const data = await response.json().catch(() => ({}));
    return data?.content || '⚠️ Unable to get a response from Nova. Check your API key configuration.';
  } catch {
    return '⚠️ **Connection Error**\n\nCould not reach the Nova API. Make sure the server is running and your `.env.local` has `NOVA_API_KEY` configured.';
  }
}

export function useAIChat(files: UploadedFile[] = []) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Nova is ready. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const assistantContent = await getApiResponse(content, files);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  }, [files]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Chat cleared. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  return { messages, isTyping, input, setInput, sendMessage, clearChat };
}
