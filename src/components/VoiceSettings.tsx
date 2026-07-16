'use client';

import { type SpeechMode, type VoiceRecognitionState } from '@/hooks/useVoiceRecognition';

interface VoiceSettingsProps {
  voice: VoiceRecognitionState;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-cyan-500/60' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}

export default function VoiceSettings({ voice }: VoiceSettingsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">Voice output</span>
        <Toggle enabled={voice.speechEnabled} onChange={voice.toggleSpeech} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">Voice mode</span>
        <select
          value={voice.speechMode}
          onChange={e => voice.setSpeechMode(e.target.value as SpeechMode)}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 outline-none focus:border-cyan-500/30"
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
            className="max-w-[130px] truncate rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 outline-none focus:border-cyan-500/30"
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
        <span className="text-xs text-white/70">Microphone</span>
        <span className={`text-[11px] ${voice.isSupported ? 'text-emerald-400' : 'text-rose-400'}`}>
          {voice.isSupported ? 'Ready' : 'Unavailable'}
        </span>
      </div>
    </div>
  );
}
