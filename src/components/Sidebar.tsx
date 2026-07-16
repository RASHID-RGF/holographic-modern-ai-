'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceSettings from '@/components/VoiceSettings';

type View = 'dashboard' | 'chat' | 'uploads' | 'documents' | 'screen-share' | 'analytics' | 'devices' | 'calendar' | 'settings';

interface NavItem {
  id: View;
  label: string;
  icon: string;
  href?: string;
}

import { type VoiceRecognitionState } from '@/hooks/useVoiceRecognition';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  voice: VoiceRecognitionState;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'chat', label: 'AI Chat', icon: '◆' },
  { id: 'uploads', label: 'Uploads', icon: '⬆' },
  { id: 'documents', label: 'Documents', icon: '◫' },
  { id: 'screen-share', label: 'Screen Share', icon: '▣' },
  { id: 'analytics', label: 'Analytics', icon: '◉' },
  { id: 'devices', label: 'Devices', icon: '◓' },
  { id: 'calendar', label: 'Calendar', icon: '◐' },
  { id: 'settings', label: 'Settings', icon: '◉' },
];

export default function Sidebar({ activeView, onNavigate, voice }: SidebarProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  return (
    <>
      {/* Mobile - collapsed icon dock */}
      <nav
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 p-2 glass-panel-light ml-2 md:ml-3"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          if (!showVoiceSettings) setShowVoiceSettings(false);
        }}
      >
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => item.href ? router.push(item.href) : onNavigate(item.id)}
            className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
              activeView === item.id
                ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                : 'text-white/30 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{item.icon}</span>

            {/* Tooltip */}
            <div
              className={`absolute left-full ml-3 px-2.5 py-1.5 rounded-lg glass-panel-light whitespace-nowrap transition-all duration-200 ${
                expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <span className="text-[10px] font-medium text-white/70">{item.label}</span>
            </div>

            {/* Active indicator */}
            {activeView === item.id && (
              <div className="absolute -left-1.5 w-1 h-5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
            )}
          </button>
        ))}

        {/* Bottom section */}
        <div className="w-8 h-px bg-white/5 my-1" />
        <button 
          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          className={`w-10 h-10 rounded-xl transition-all text-lg ${
            showVoiceSettings 
              ? 'bg-cyan-500/15 text-cyan-300' 
              : 'text-white/20 hover:text-white/50 hover:bg-white/5'
          }`}
        >
          🎤
        </button>
      </nav>

      {/* Voice settings panel */}
      {showVoiceSettings && expanded && (
        <div className="fixed left-16 top-1/2 -translate-y-1/2 z-50 glass-panel-light p-3 rounded-xl w-48">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Voice Settings</span>
            <button 
              onClick={() => setShowVoiceSettings(false)}
              className="text-white/40 hover:text-white/70 text-xs"
            >
              ✕
            </button>
          </div>
          <VoiceSettings voice={voice} />
        </div>
      )}

      {/* Desktop sidebar spacer for layout */}
      <div className="hidden md:block w-16 flex-shrink-0" />
    </>
  );
}
