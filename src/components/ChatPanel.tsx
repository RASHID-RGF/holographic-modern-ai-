'use client';

import { useRef, useEffect } from 'react';
import type { UploadedFile } from '@/types';
import { useAIChat } from '@/hooks/useAIChat';
import { useVoiceRecognition, type SpeechMode } from '@/hooks/useVoiceRecognition';

interface ChatPanelProps {
  onLaunchShare?: () => void;
  files?: UploadedFile[];
}

function NovaIcon() {
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

export default function ChatPanel({ onLaunchShare, files = [] }: ChatPanelProps) {
  const { messages, isTyping, input, setInput, sendMessage, clearChat } = useAIChat(files);
  const voice = useVoiceRecognition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length <= 1 || !voice.speechEnabled) return;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === 'assistant') {
      const spokenText = latestMessage.content
        .replace(/[-•]\s*/gm, ' ')
        .replace(/\n+/g, ' ')
        .trim();

      if (spokenText) {
        voice.speak(spokenText);
      }
    }
  }, [messages, voice.speechEnabled, voice.speak]);

  // Sync voice transcript only when actively listening
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

  // GPT-like prose rendering: no special markdown parsing, just clean text
  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-sm leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col animate-fadeInUp rounded-2xl border border-white/[0.06] bg-black/30 backdrop-blur-xl" style={{ maxHeight: '620px' }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
            <NovaIcon />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/90">Nova</h3>
            <p className="text-[10px] text-white/30">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[300px] max-h-[360px]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 animate-fadeInUp ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {msg.role === 'assistant' ? (
                <NovaIcon />
              ) : (
                <span className="text-[11px] font-medium">U</span>
              )}
            </div>

            {/* Message bubble — GPT-like clean design */}
            <div
              className={`max-w-[80%] ${
                msg.role === 'assistant'
                  ? 'text-white/85'
                  : 'text-white/90'
              }`}
            >
              <div
                className={`${
                  msg.role === 'assistant'
                    ? 'bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-3'
                    : 'bg-cyan-500/12 rounded-2xl rounded-tr-sm px-4 py-3'
                }`}
              >
                {renderMessage(msg.content)}
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-fadeInUp">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <NovaIcon />
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

      {/* Voice waveform */}
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

      {/* Input area */}
      <div className="px-5 py-3 border-t border-white/[0.06]">
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map(file => (
              <span key={file.id} className="rounded-lg border border-cyan-500/15 bg-cyan-500/8 px-2.5 py-1 text-[10px] text-cyan-300/70">
                {file.type === 'image' ? 'Image' : 'PDF'} — {file.name}
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
              placeholder="Ask Nova anything..."
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
