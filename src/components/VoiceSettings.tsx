'use client';

import { type SpeechMode, type VoiceRecognitionState } from '@/hooks/useVoiceRecognition';

interface VoiceSettingsProps {
  voice: VoiceRecognitionState;
}

export default function VoiceSettings({ voice }: VoiceSettingsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">Voice Output</span>
        <button
          onClick={voice.toggleSpeech}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            voice.speechEnabled ? 'bg-cyan-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              voice.speechEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">Voice Mode</span>
        <select
          value={voice.speechMode}
          onChange={e => voice.setSpeechMode(e.target.value as SpeechMode)}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70 outline-none"
        >
          <option value="default">Default</option>
          <option value="calm">Calm</option>
          <option value="energetic">Energetic</option>
          <option value="whisper">Whisper</option>
          <option value="deep">Deep</option>
        </select>
      </div>

      {voice.availableVoices.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Voice</span>
          <select
            value={voice.selectedVoiceName}
            onChange={e => voice.setSelectedVoice(e.target.value)}
            className="max-w-[120px] truncate rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70 outline-none"
          >
            {voice.availableVoices.map(availableVoice => (
              <option key={availableVoice.name} value={availableVoice.name}>
                {availableVoice.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">Mic Access</span>
        <span className={`text-[10px] ${voice.isSupported ? 'text-emerald-400' : 'text-rose-400'}`}>
          {voice.isSupported ? 'Available' : 'Not Supported'}
        </span>
      </div>
    </div>
  );
}
