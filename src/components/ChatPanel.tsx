'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import type { UploadedFile } from '@/types';
import { useAIChat } from '@/hooks/useAIChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { renderFormattedContent } from '@/lib/formatResponse';


interface ChatPanelProps {
  onLaunchShare?: () => void;
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
}

function RAOQIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

// Clean text for speech: remove formatting, headers, greetings, and noise
function cleanForSpeech(text: string): string {
  let cleaned = text;

  // Remove asterisks and markdown formatting
  cleaned = cleaned.replace(/\*{1,3}/g, '');
  cleaned = cleaned.replace(/_{1,3}/g, '');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // Remove emojis (Unicode emoji ranges)
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');

  // Remove markdown headings (e.g. "## Heading")
  cleaned = cleaned.replace(/^\s{0,3}#{1,6}\s+/gm, '');

  // Remove section headers/labels (short lines ending with colon)
  cleaned = cleaned.replace(/^\s*[A-Z][a-z]+\s*:\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*:\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*:\s*$/gm, '');


  // Remove common greetings and filler phrases at the START of text only
  cleaned = cleaned.replace(/^\s*(hello|hi|hey|greetings|welcome|good morning|good afternoon|good evening)[,.!]*\s*/i, '');
  cleaned = cleaned.replace(/^\s*(sure|certainly|absolutely|of course|no problem|you're welcome|glad to help)[,.!]*\s*/i, '');

  // Remove numbered list markers but keep content
  cleaned = cleaned.replace(/^\s*\d+[.)]\s*/gm, '');

  // Remove bullet markers but keep content
  cleaned = cleaned.replace(/^\s*[-•*]\s*/gm, '');

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{2,}/g, '\n');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  return cleaned.trim();
}

export default function ChatPanel({ onLaunchShare, files = [], onFilesChange }: ChatPanelProps) {
  const {
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
  } = useAIChat(files);
  const voice = useVoiceRecognition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showChatList, setShowChatList] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length <= 1 || !voice.speechEnabled) return;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === 'assistant') {
      const spokenText = cleanForSpeech(latestMessage.content);

      if (spokenText) {
        voice.speak(spokenText);
      }
    }
  }, [messages, voice.speechEnabled, voice.speak]);

  useEffect(() => {
    if (voice.isListening && voice.transcript) {
      setInput(voice.transcript);
    }
  }, [voice.transcript, voice.isListening, setInput]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col animate-fadeInUp rounded-2xl border border-white/[0.06] bg-black/30 backdrop-blur-xl" style={{ maxHeight: '620px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/20">
            <Image
              src="/nova.jpeg"
              alt="AI profile"
              width={28}
              height={28}
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">RAOQ AI</h3>
            <p className="text-[10px] text-white/30">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={createNewChat}
            className="rounded-lg border border-cyan-400/20 px-2.5 py-1.5 text-[10px] text-cyan-300/70 transition hover:bg-cyan-500/15 flex items-center gap-1"
            title="New Chat"
          >
            <PlusIcon /> New
          </button>
          <button
            onClick={() => setShowChatList(!showChatList)}
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] transition ${
              showChatList
                ? 'border-cyan-400/20 bg-cyan-500/15 text-cyan-300/80'
                : 'border-white/[0.06] text-white/40 hover:text-white/60'
            }`}
          >
            Chats ({chats.length})
          </button>
          <button
            onClick={voice.toggleSpeech}
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] transition ${
              voice.speechEnabled
                ? 'border-cyan-400/20 bg-cyan-500/8 text-cyan-300/70 hover:bg-cyan-500/15'
                : 'border-white/[0.06] text-white/40 hover:text-white/60'
            }`}
          >
            {voice.speechEnabled ? 'Voice on' : 'Voice off'}
          </button>
          {onLaunchShare && (
            <button
              onClick={onLaunchShare}
              className="rounded-lg border border-cyan-400/20 px-2.5 py-1.5 text-[10px] text-cyan-300/70 transition hover:bg-cyan-500/15"
            >
              Share
            </button>
          )}
          <button
            onClick={clearChat}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chat List Dropdown */}
      {showChatList && (
        <div className="border-b border-white/[0.06] max-h-[200px] overflow-y-auto">
          <div className="p-2 space-y-1">
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                  activeChatId === chat.id
                    ? 'bg-cyan-500/15 border border-cyan-400/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                onClick={() => {
                  switchChat(chat.id);
                  setShowChatList(false);
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate">{chat.title}</p>
                  <p className="text-[10px] text-white/30">{chat.messages.length - 1} messages</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="ml-2 p-1 rounded text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete chat"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[300px] max-h-[360px]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 animate-fadeInUp ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Image
                  src="/nova.jpeg"
                  alt="AI profile"
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-[11px] font-medium">U</span>
              )}

            </div>

            <div className={`max-w-[80%] ${msg.role === 'assistant' ? 'text-white/85' : 'text-white/90'}`}>
              <div
                className={`${
                  msg.role === 'assistant'
                    ? 'bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3'
                    : 'bg-cyan-500/12 rounded-2xl rounded-tr-sm px-4 py-3'
                }`}
              >
                {msg.role === 'assistant'
                  ? renderFormattedContent(msg.content)
                  : msg.content.split('\n').map((line, li) => (
                      <p key={li} className="text-sm leading-relaxed text-white/90">{line || '\u00A0'}</p>
                    ))
                }
              </div>
              <div className={`text-[9px] text-white/20 mt-1 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3 animate-fadeInUp">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/[0.08] flex items-center justify-center flex-shrink-0">
              <Image
                src="/nova.jpeg"
                alt="AI profile"
                width={28}
                height={28}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s' }} />
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Waveform */}
      {voice.isListening && (
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-[2px] h-8 w-full max-w-[200px] mx-auto">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  height: `${Math.max(2, Math.random() * 16 + 2)}px`,
                  width: '3px',
                  background: 'rgba(0, 229, 255, 0.4)',
                }}
              />
            ))}
          </div>
          {voice.transcript && (
            <p className="text-[10px] text-white/30 text-center mt-1 italic">
              &ldquo;{voice.transcript}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="px-5 py-3 border-t border-white/[0.06]">
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map(file => (
              <span key={file.id} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/15 bg-cyan-500/8 px-2.5 py-1 text-[10px] text-cyan-300/70">
                {file.type === 'image' ? '🖼' : '📄'} {file.name}
                {onFilesChange && (
                  <button
                    onClick={() => onFilesChange(files.filter(f => f.id !== file.id))}
                    className="w-3.5 h-3.5 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 hover:bg-rose-500/60 hover:text-white transition-all"
                    title="Remove"
                  >
                    <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RAOQ AI anything..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-cyan-500/25 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <button
            onClick={voice.toggleListening}
            className={`p-2.5 rounded-xl transition-all ${
              voice.isListening
                ? 'bg-red-500/15 border border-red-500/20'
                : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            <span className="text-sm">{voice.isListening ? '🔴' : '🎤'}</span>
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-cyan-300/80"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
