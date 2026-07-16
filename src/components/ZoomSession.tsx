'use client';

import { useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/types';
import { getApiResponse } from '@/hooks/useAIChat';
import { type VoiceRecognitionState } from '@/hooks/useVoiceRecognition';
import { renderFormattedContent } from '@/lib/formatResponse';
import VoiceWaveform from '@/components/VoiceWaveform';

interface ZoomSessionProps {
  files?: UploadedFile[];
  voice: VoiceRecognitionState;
}

interface ZoomMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

function createMessage(role: ZoomMessage['role'], content: string): ZoomMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

const silencePrompts = [
  "I'm still here with you. Take your time — no rush.",
  "The quiet is comfortable, isn't it? Whenever you're ready, I'm listening.",
  "Silence can be golden. But if something's on your mind, I'm all ears.",
  "I can wait. Sometimes the best thoughts come after a pause.",
  "Still here. Still listening. Ready when you are.",
  "A moment of stillness... What are you thinking about?",
  "I enjoy the calm, but I'd love to hear what's on your mind.",
  "No pressure. Just know I'm right here when you want to talk.",
  "The room is quiet, but my attention is all yours.",
  "Sometimes a pause helps us find the right words. I'm waiting patiently.",
];

const greetings = [
  "Hello! I'm Nova. All yours for a one-on-one conversation. Speak whenever you're ready.",
  "Hey there! Nova here. This is your private space — just talk and I'll respond.",
  "I'm Nova, your conversation partner. Go ahead — I'm listening and I'll keep the dialogue moving.",
];

function MicIcon({ isListening }: { isListening: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function MicMutedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="8" y1="18" x2="16" y2="18" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function ZoomSession({ files = [], voice }: ZoomSessionProps) {
  const [messages, setMessages] = useState<ZoomMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const lastProcessedRef = useRef('');

  const processTranscript = async (finalText: string) => {
    if (!finalText || finalText === lastProcessedRef.current) return;
    lastProcessedRef.current = finalText;

    if (!hasInteracted) {
      setHasInteracted(true);
      setShowTranscript(true);
      setMessages(prev => [
        ...prev,
        createMessage('assistant', greetings[Math.floor(Math.random() * greetings.length)]),
      ]);
    }

    setMessages(prev => [...prev, createMessage('user', finalText)]);
    setIsThinking(true);

    const response = await getApiResponse(finalText, files);
    setMessages(prev => [...prev, createMessage('assistant', response)]);
    setIsThinking(false);

    if (voice.speechEnabled) {
      const cleanText = response.replace(/\n+/g, ' ').trim();
      if (cleanText) voice.speak(cleanText);
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleMicTap = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setMessages([createMessage('assistant', greetings[Math.floor(Math.random() * greetings.length)])]);
      setShowTranscript(true);
    }
    voice.toggleListening();
  };

  const handleMicToggle = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setMessages([createMessage('assistant', greetings[Math.floor(Math.random() * greetings.length)])]);
      setShowTranscript(true);
    }
    voice.toggleListening();
  };

  useEffect(() => {
    if (!voice.isListening) return;

    const transcript = voice.transcript.trim();

    if (!transcript) {
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      return;
    }

    if (transcript === lastProcessedRef.current) return;

    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }

    speechTimeoutRef.current = window.setTimeout(() => {
      const finalText = transcript;

      if (!finalText || finalText === lastProcessedRef.current) return;
      lastProcessedRef.current = finalText;

      if (!hasInteracted) {
        setHasInteracted(true);
        setShowTranscript(true);
        setMessages(prev => [
          ...prev,
          createMessage('assistant', greetings[Math.floor(Math.random() * greetings.length)]),
        ]);
      }

      setMessages(prev => [...prev, createMessage('user', finalText)]);
      setIsThinking(true);

      getApiResponse(finalText, files).then(response => {
        setMessages(prev => [...prev, createMessage('assistant', response)]);
        setIsThinking(false);

        if (voice.speechEnabled) {
          const cleanText = response.replace(/\n+/g, ' ').trim();
          if (cleanText) voice.speak(cleanText);
        }
      });

      voice.resetTranscript();
    }, 1500);

    return () => {
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [voice.isListening, voice.transcript, voice.speechEnabled, voice.speak, voice.resetTranscript, files, hasInteracted]);

  useEffect(() => {
    if (voice.isListening || !voice.transcript.trim()) return;
    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    processTranscript(voice.transcript.trim());
    voice.resetTranscript();
  }, [voice.isListening, voice.transcript, voice.resetTranscript]);

  const [silenceCount, setSilenceCount] = useState(0);

  useEffect(() => {
    if (!voice.isListening) return;

    const silenceDelay = messages.length > 1 ? 8000 : 12000;

    const timeout = window.setTimeout(() => {
      if (!voice.transcript.trim()) {
        const promptIndex = Math.min(silenceCount, silencePrompts.length - 1);
        const response = silencePrompts[promptIndex % silencePrompts.length];
        setMessages(prev => [...prev, createMessage('assistant', response)]);
        setSilenceCount(prev => prev + 1);

        if (voice.speechEnabled) {
          const cleanText = response.replace(/\n+/g, ' ').trim();
          if (cleanText) voice.speak(cleanText);
        }
      }
    }, silenceDelay);

    return () => window.clearTimeout(timeout);
  }, [voice.isListening, voice.transcript, silenceCount, voice.speechEnabled, voice.speak, messages.length]);

  const renderContent = (content: string) => {
    return renderFormattedContent(content);
  };

  const isLiveActive = voice.isListening && voice.transcript.trim();

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Microphone section */}
      <div className="flex flex-col items-center gap-3">
        {/* Mic button — clean circle with minimal indicator */}
        <button
          onClick={handleMicTap}
          className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ${
            voice.isListening ? 'scale-100' : 'hover:scale-105 active:scale-95'
          }`}
          style={{ width: 88, height: 88 }}
          aria-label={voice.isListening ? 'Stop listening' : 'Start listening'}
        >
          {/* Subtle listening ring */}
          {voice.isListening && (
            <div
              className="absolute inset-0 rounded-full animate-pulse opacity-40"
              style={{
                background: 'rgba(0, 229, 255, 0.08)',
                animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          )}

          {/* Mic body */}
          <div
            className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300 ${
              voice.isListening
                ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/15 border border-cyan-500/25 shadow-[0_0_30px_rgba(0,229,255,0.12)]'
                : 'bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
            }`}
            style={{ width: 72, height: 72 }}
          >
            <div className={`transition-colors duration-300 ${
              voice.isListening ? 'text-cyan-300' : 'text-white/40 group-hover:text-white/60'
            }`}>
              {voice.isListening ? (
                <MicIcon isListening={true} />
              ) : (
                <MicMutedIcon />
              )}
            </div>
          </div>
        </button>

        {/* Toggle button */}
        <button
          onClick={handleMicToggle}
          className={`rounded-full border px-4 py-1.5 text-[11px] transition-all duration-200 ${
            voice.isListening
              ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300/80 hover:bg-cyan-500/15'
              : 'border-white/10 text-white/50 hover:text-white/70 hover:border-white/20'
          }`}
        >
          {voice.isListening ? 'Stop' : 'Start'}
        </button>

        {/* Status text */}
        <p className="text-[11px] text-white/40 select-none">
          {voice.isListening
            ? isThinking
              ? 'Thinking...'
              : isLiveActive
                ? 'Speaking...'
                : 'Listening'
            : voice.isSupported
              ? 'Tap the microphone to start'
              : 'Voice not supported'}
        </p>

        {/* Voice waveform */}
        {voice.isListening && (
          <div className="transition-all duration-500">
            <VoiceWaveform isActive={true} amplitude={voice.amplitude} barCount={24} />
          </div>
        )}
      </div>

      {/* Live caption */}
      <div className="w-full max-w-lg min-h-[48px] flex items-center justify-center">
        {isLiveActive && (
          <div className="animate-fadeIn rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 w-full">
            <p className="text-center text-sm text-white/60 font-light leading-relaxed">
              {voice.transcript}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s' }} />
              <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
              <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Conversation transcript */}
      {showTranscript && (
        <div className="w-full max-w-2xl space-y-4 pt-2">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`relative rounded-xl px-4 py-3 ${
                  isUser
                    ? 'bg-cyan-500/8 border border-cyan-500/10 text-white/80 ml-6 md:ml-12'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/70 mr-6 md:mr-12'
                }`}>
                  <span className="block text-[9px] text-white/30 mb-1.5">
                    {isUser ? 'You' : 'Nova'}
                  </span>
                  {renderContent(msg.content)}
                </div>
              </div>
            );
          })}

          {/* Thinking dots */}
          {isThinking && (
            <div className="animate-fadeInUp mr-6 md:mr-12">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <span className="block text-[9px] text-white/30 mb-2">Nova</span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDuration: '0.8s' }} />
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>
      )}
    </div>
  );
}
