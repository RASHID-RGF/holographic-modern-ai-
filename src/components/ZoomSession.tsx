'use client';

import { useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/types';
import { getApiResponse } from '@/hooks/useAIChat';
import { type VoiceRecognitionState } from '@/hooks/useVoiceRecognition';
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

function MicIcon({ isListening, isThinking }: { isListening: boolean; isThinking: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={`w-full h-full transition-transform duration-300 ${isListening ? 'scale-110' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="4" width="12" height="22" rx="6" className="transition-all duration-500" style={{ opacity: isListening ? (isThinking ? 0.6 : 1) : 0.7 }} />
      {isListening && !isThinking && (
        <>
          <path d="M14 22a10 10 0 0 0 20 0" strokeWidth="1.8" className="animate-pulse" />
          <path d="M10 22a14 14 0 0 0 28 0" strokeWidth="1.4" opacity="0.6" style={{ animationDelay: '0.3s' }} />
          <path d="M6 22a18 18 0 0 0 36 0" strokeWidth="1" opacity="0.3" style={{ animationDelay: '0.6s' }} />
        </>
      )}
      <line x1="24" y1="28" x2="24" y2="36" />
      <line x1="16" y1="36" x2="32" y2="36" />
      <line x1="20" y1="44" x2="28" y2="44" />
      {isThinking && (
        <>
          <line x1="34" y1="14" x2="42" y2="22" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="14" x2="34" y2="22" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
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

    // Fetch real AI response via the API
    const response = await getApiResponse(finalText, files);
    setMessages(prev => [...prev, createMessage('assistant', response)]);
    setIsThinking(false);

    if (voice.speechEnabled) {
      const cleanText = response.replace(/\n+/g, ' ').trim();
      if (cleanText) voice.speak(cleanText);
    }
  };

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initial greeting on first mic tap
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

  // Live speech detection with debounce
  // As user speaks, words appear in the live caption (voice.transcript)
  // When they pause for 1.5s, the utterance gets processed
  useEffect(() => {
    if (!voice.isListening) return;

    const transcript = voice.transcript.trim();

    if (!transcript) {
      // No speech right now — clear any pending processing
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      return;
    }

    // Don't re-process the same text
    if (transcript === lastProcessedRef.current) return;

    // Clear previous timeout — user is still speaking or transcript changed
    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }

    // Set a debounce: if transcript stays the same for 1.5s, process it
    speechTimeoutRef.current = window.setTimeout(() => {
      const finalText = transcript;

      // Only process if we haven't already processed this exact text
      if (!finalText || finalText === lastProcessedRef.current) return;
      lastProcessedRef.current = finalText;

      // First interaction — add greeting
      if (!hasInteracted) {
        setHasInteracted(true);
        setShowTranscript(true);
        setMessages(prev => [
          ...prev,
          createMessage('assistant', greetings[Math.floor(Math.random() * greetings.length)]),
        ]);
      }

      // Add user message
      setMessages(prev => [...prev, createMessage('user', finalText)]);

      // Nova thinks
      setIsThinking(true);

      // Fetch real AI response via the API
      getApiResponse(finalText, files).then(response => {
        setMessages(prev => [...prev, createMessage('assistant', response)]);
        setIsThinking(false);

        if (voice.speechEnabled) {
          const cleanText = response.replace(/\n+/g, ' ').trim();
          if (cleanText) voice.speak(cleanText);
        }
      });

      // Clear the transcript so next speech starts fresh
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

  // Silence detection for ambient prompts (when no speech for a while)
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
    return content.split('\n').map((line, li) => {
      if (line.trim() === '') return <br key={li} />;
      return <p key={li} className="text-sm leading-relaxed font-light tracking-wide">{line}</p>;
    });
  };

  const isLiveActive = voice.isListening && voice.transcript.trim();

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Floating Microphone */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleMicTap}
          className={`group relative flex items-center justify-center transition-all duration-500 ${
            voice.isListening ? 'scale-100' : 'hover:scale-105 active:scale-95'
          }`}
          style={{ width: 120, height: 120 }}
          aria-label={voice.isListening ? 'Stop listening' : 'Start listening'}
        >
          {/* Outer glow ring */}
          <div
            className={`absolute rounded-full transition-all duration-700 ${
              voice.isListening ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
            }`}
            style={{
              width: 160, height: 160,
              background: `conic-gradient(from var(--angle, 0deg), transparent 30%, ${
                voice.isListening
                  ? 'rgba(0, 229, 255, 0.25), rgba(124, 77, 255, 0.2)'
                  : 'rgba(0, 229, 255, 0.08), rgba(124, 77, 255, 0.06)'
              }, transparent 70%)`,
              filter: 'blur(4px)',
              animation: voice.isListening ? 'spin-slow 6s linear infinite' : 'none',
            }}
          />

          {/* Mid ring */}
          <div
            className={`absolute rounded-full border transition-all duration-500 ${
              voice.isListening
                ? 'border-cyan-400/30 shadow-[0_0_30px_rgba(0,229,255,0.15)]'
                : 'border-white/10 shadow-[0_0_15px_rgba(0,229,255,0.05)]'
            }`}
            style={{ width: 136, height: 136 }}
          >
            {voice.isListening && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 65%, rgba(0, 229, 255, 0.15), rgba(124, 77, 255, 0.1), transparent)',
                  animation: 'spin-slow 4s linear infinite',
                  mask: 'radial-gradient(circle at 50% 50%, transparent 60%, black 61%)',
                  WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 60%, black 61%)',
                }}
              />
            )}
          </div>

          {/* Pulse rings */}
          {voice.isListening && (
            <>
              <div className="absolute rounded-full animate-ping opacity-20 border border-cyan-400/40" style={{ width: 188, height: 188, animationDuration: '2s' }} />
              <div className="absolute rounded-full animate-ping opacity-10 border border-violet-400/30" style={{ width: 216, height: 216, animationDuration: '3s', animationDelay: '0.5s' }} />
            </>
          )}

          {/* Mic button body */}
          <div
            className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-500 ${
              voice.isListening
                ? 'bg-gradient-to-br from-cyan-500/25 to-violet-500/20 shadow-[0_0_40px_rgba(0,229,255,0.2)]'
                : 'bg-white/[0.06] hover:bg-white/[0.09] shadow-[0_0_20px_rgba(0,229,255,0.05)]'
            }`}
            style={{ width: 104, height: 104 }}
          >
            <div className={`transition-colors duration-500 ${voice.isListening ? 'text-cyan-300' : 'text-white/60 group-hover:text-white/80'}`} style={{ width: 44, height: 44 }}>
              <MicIcon isListening={voice.isListening} isThinking={isThinking} />
            </div>
          </div>

          {/* Hover label */}
          <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] transition-all duration-300 ${
            voice.isListening ? 'opacity-0 translate-y-1' : 'opacity-0 group-hover:opacity-100'
          }`} style={{ color: 'rgba(0, 229, 255, 0.5)' }}>
            Tap to talk
          </div>
        </button>

        <button
          onClick={handleMicToggle}
          className={`rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.3em] transition-all duration-300 ${
            voice.isListening
              ? 'border-cyan-400/30 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20'
              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          {voice.isListening ? 'Stop microphone' : 'Turn on microphone'}
        </button>

        {/* Status text */}
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/30 select-none">
          {voice.isListening
            ? isThinking
              ? 'Thinking...'
              : isLiveActive
                ? 'Speaking...'
                : 'Listening'
            : voice.isSupported
              ? 'Tap the microphone'
              : 'Voice not supported'}
        </p>

        {/* Voice waveform */}
        {voice.isListening && (
          <div className="h-12 w-48 transition-all duration-500">
            <VoiceWaveform isActive={true} amplitude={voice.amplitude} barCount={28} />
          </div>
        )}
      </div>

      {/* LIVE CAPTION — words appear here as you speak */}
      <div className="w-full max-w-lg min-h-[56px] flex items-center justify-center">
        {isLiveActive && (
          <div className="animate-fadeIn rounded-2xl border border-cyan-400/15 bg-cyan-500/6 px-6 py-4 w-full">
            <p className="text-center text-base text-cyan-200/80 font-light tracking-wide leading-relaxed">
              {voice.transcript}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              <span className="w-1 h-1 rounded-full bg-cyan-400/60 animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1 h-1 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
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
                <div className={`relative rounded-2xl px-5 py-3 ${
                  isUser
                    ? 'bg-cyan-500/6 border border-cyan-500/8 text-cyan-100/80 ml-6 md:ml-12'
                    : 'bg-white/[0.03] border border-white/[0.05] text-white/70 mr-6 md:mr-12'
                }`}>
                  <span className="block text-[8px] uppercase tracking-[0.35em] text-cyan-400/40 mb-1.5">
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
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-4">
                <span className="block text-[8px] uppercase tracking-[0.35em] text-cyan-400/40 mb-2">Nova</span>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
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
