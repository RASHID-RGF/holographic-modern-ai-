'use client';

import { useState, useCallback } from 'react';
import type { Message, UploadedFile, Chat } from '@/types';

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
    return data?.content || '⚠️ Unable to get a response from RAOQ AI. Check your API key configuration.';
  } catch {
    return '⚠️ **Connection Error**\n\nCould not reach the RAOQ AI API. Make sure the server is running and your `.env.local` has `NOVA_API_KEY` configured.';
  }
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function generateChatTitle(content: string): string {
  const words = content.trim().split(/\s+/).slice(0, 5).join(' ');
  return words.length > 40 ? words.slice(0, 40) + '...' : words;
}

export function useAIChat(files: UploadedFile[] = []) {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'default',
      title: 'New Chat',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: '👋 RAOQ AI is ready. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
          timestamp: Date.now(),
        },
      ],
      timestamp: Date.now(),
    },
  ]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messages = activeChat.messages;

  const updateChatMessages = useCallback((chatId: string, updater: (msgs: Message[]) => Message[]) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      return { ...chat, messages: updater(chat.messages) };
    }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Update chat title based on first message
    setChats(prev => prev.map(chat => {
      if (chat.id !== activeChatId) return chat;
      const isFirstUserMessage = chat.messages.filter(m => m.role === 'user').length === 0;
      return {
        ...chat,
        messages: [...chat.messages, userMsg],
        title: isFirstUserMessage ? generateChatTitle(content) : chat.title,
      };
    }));

    setInput('');
    setIsTyping(true);

    const assistantContent = await getApiResponse(content, files);

    const aiMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
    };

    updateChatMessages(activeChatId, prev => [...prev, aiMsg]);
    setIsTyping(false);
  }, [files, activeChatId, updateChatMessages]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: '👋 RAOQ AI is ready. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
          timestamp: Date.now(),
        },
      ],
      timestamp: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId);
      if (filtered.length === 0) {
        // Create a new default chat if all chats are deleted
        const defaultChat: Chat = {
          id: generateId(),
          title: 'New Chat',
          messages: [
            {
              id: 'welcome',
              role: 'assistant',
              content: '👋 RAOQ AI is ready. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
              timestamp: Date.now(),
            },
          ],
          timestamp: Date.now(),
        };
        setActiveChatId(defaultChat.id);
        return [defaultChat];
      }
      if (activeChatId === chatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeChatId]);

  const clearChat = useCallback(() => {
    updateChatMessages(activeChatId, () => [
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 Chat cleared. Ask me anything — I\'ll fetch real AI responses using the configured API key.',
        timestamp: Date.now(),
      },
    ]);
  }, [activeChatId, updateChatMessages]);

  return {
    messages,
    isTyping,
    input,
    setInput,
    sendMessage,
    clearChat,
    chats,
    activeChatId,
    createNewChat,
    switchChat,
    deleteChat,
  };
}
