'use client';

import { useState, useEffect, useCallback } from 'react';

export type SpeechMode = 'default' | 'calm' | 'energetic' | 'whisper' | 'deep';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  amplitude: number;
}

interface SpeechState {
  isSpeaking: boolean;
  speechEnabled: boolean;
  speechMode: SpeechMode;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isSupported: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
    amplitude: 0,
  });

  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    speechEnabled: true,
    speechMode: 'default',
    availableVoices: [],
    selectedVoiceName: '',
  });

  // Load persisted settings from localStorage on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedEnabled = localStorage.getItem('nova-speech-enabled');
    const savedMode = localStorage.getItem('nova-speech-mode');
    const savedVoice = localStorage.getItem('nova-voice-name');
    
    setSpeechState(prev => ({
      ...prev,
      speechEnabled: savedEnabled !== 'false',
      speechMode: (savedMode as SpeechMode) || 'default',
      selectedVoiceName: savedVoice || '',
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    const instance = new SpeechRecognitionCtor() as SpeechRecognitionInstance;
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = 'en-US';

    instance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: finalTranscript || interimTranscript,
        amplitude: Math.random() * 0.8 + 0.2,
      }));
    };

    instance.onerror = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    instance.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    setRecognition(instance);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSpeechState(prev => ({
        ...prev,
        availableVoices: voices,
        selectedVoiceName: prev.selectedVoiceName || voices.find(voice => voice.lang.startsWith('en'))?.name || '',
      }));
    };

    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (state.isListening) {
      recognition.stop();
      setState(prev => ({ ...prev, isListening: false }));
    } else {
      try {
        recognition.start();
        setState(prev => ({ ...prev, isListening: true, transcript: '' }));
      } catch {
        // Recognition already started
      }
    }
  }, [recognition, state.isListening]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !speechState.speechEnabled || !text?.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    const config = {
      default: { rate: 1, pitch: 1, volume: 1 },
      calm: { rate: 0.9, pitch: 0.95, volume: 0.9 },
      energetic: { rate: 1.12, pitch: 1.05, volume: 1 },
      whisper: { rate: 0.8, pitch: 0.85, volume: 0.75 },
      deep: { rate: 0.95, pitch: 0.8, volume: 0.95 },
    }[speechState.speechMode];

    const selectedVoice = speechState.availableVoices.find(voice => voice.name === speechState.selectedVoiceName)
      || speechState.availableVoices.find(voice => voice.lang.startsWith('en'))
      || null;

    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.voice = selectedVoice || null;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    utterance.onstart = () => setSpeechState(prev => ({ ...prev, isSpeaking: true }));
    utterance.onend = () => setSpeechState(prev => ({ ...prev, isSpeaking: false }));
    utterance.onerror = () => setSpeechState(prev => ({ ...prev, isSpeaking: false }));

    window.speechSynthesis.speak(utterance);
  }, [speechState.availableVoices, speechState.speechEnabled, speechState.speechMode, speechState.selectedVoiceName]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setSpeechState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const toggleSpeech = useCallback(() => {
    setSpeechState(prev => {
      const newValue = !prev.speechEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova-speech-enabled', String(newValue));
      }
      return { ...prev, speechEnabled: newValue };
    });
  }, []);

  const setSpeechMode = useCallback((mode: SpeechMode) => {
    setSpeechState(prev => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova-speech-mode', mode);
      }
      return { ...prev, speechMode: mode };
    });
  }, []);

  const setSelectedVoice = useCallback((voiceName: string) => {
    setSpeechState(prev => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova-voice-name', voiceName);
      }
      return { ...prev, selectedVoiceName: voiceName };
    });
  }, []);

  return {
    ...state,
    ...speechState,
    toggleListening,
    toggleSpeech,
    stopSpeaking,
    speak,
    setSpeechMode,
    setSelectedVoice,
    resetTranscript: () => setState(prev => ({ ...prev, transcript: '' })),
  };
}

export type VoiceRecognitionState = ReturnType<typeof useVoiceRecognition>;
