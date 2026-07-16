'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UploadedFile } from '@/types';
import StatusBar from '@/components/StatusBar';
import Sidebar from '@/components/Sidebar';
import ParticleBackground from '@/components/ParticleBackground';
import AIOrb from '@/components/AIOrb';
import ChatPanel from '@/components/ChatPanel';
import HUDElements from '@/components/HUDElements';
import SystemAnalytics from '@/components/SystemAnalytics';
import WeatherWidget from '@/components/WeatherWidget';
import CalendarWidget from '@/components/CalendarWidget';
import NotificationsPanel from '@/components/NotificationsPanel';
import SmartHomePanel from '@/components/SmartHomePanel';
import CodingAssistant from '@/components/CodingAssistant';
import NewsFeed from '@/components/NewsFeed';
import VoiceWaveform from '@/components/VoiceWaveform';
import WorkspaceModules from '@/components/WorkspaceModules';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

type View = 'dashboard' | 'chat' | 'uploads' | 'documents' | 'screen-share' | 'analytics' | 'devices' | 'calendar' | 'settings';

type ThemeId = 'midnight' | 'forest' | 'sunset' | 'ocean' | 'lavender' | 'matrix';

const themeOptions: Array<{ id: ThemeId; label: string }> = [
  { id: 'midnight', label: 'Midnight' },
  { id: 'forest', label: 'Forest' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'matrix', label: 'Matrix' },
];

export default function Home() {
  const voice = useVoiceRecognition();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [themeIndex, setThemeIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  const handleOrbClick = useCallback(() => {
    if (voice.isSupported) {
      voice.toggleListening();
    } else {
      setActiveView(prev => prev === 'dashboard' ? 'chat' : 'dashboard');
    }
  }, [voice]);

  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
  }, []);

  const handleLaunchShare = useCallback(() => {
    setActiveView('screen-share');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeOptions[themeIndex].id;
  }, [themeIndex]);

  useEffect(() => {
    if (!autoCycle) return;

    const interval = window.setInterval(() => {
      setThemeIndex(prev => (prev + 1) % themeOptions.length);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [autoCycle]);

  return (
    <div className="relative min-h-screen overflow-hidden theme-shell">
      {/* Background layers */}
      <div className="fixed inset-0" style={{ backgroundColor: 'var(--bg-deep)' }} />
      <div className="fixed inset-0 bg-grid opacity-40" />
      <div className="fixed inset-0 aurora-gradient" />
      <ParticleBackground />

      {/* Main layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Status bar */}
        <StatusBar />

        <div className="flex flex-1">
          {/* Sidebar navigation */}
          <Sidebar activeView={activeView} onNavigate={setActiveView} voice={voice} />

          {/* Main content area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="flex flex-col items-center gap-3 mb-8 md:mb-10">
              <div className="flex flex-wrap items-center justify-center gap-2 glass-panel-light px-3 py-2">
                <button
                  onClick={() => setThemeIndex(prev => (prev + 1) % themeOptions.length)}
                  className="theme-chip rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] transition hover:opacity-90"
                >
                  Theme: {themeOptions[themeIndex].label}
                </button>
                <button
                  onClick={() => setAutoCycle(prev => !prev)}
                  className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] transition ${
                    autoCycle ? 'theme-chip-active' : 'theme-chip'
                  }`}
                >
                  {autoCycle ? 'Auto cycle on' : 'Auto cycle off'}
                </button>
              </div>

              {/* View toggle */}
              <div className="flex flex-wrap items-center justify-center gap-2 glass-panel-light px-2 py-1">
                {[
                  { id: 'dashboard', label: '◈ Dashboard', href: undefined },
                  { id: 'chat', label: '◆ AI Chat', href: undefined },
                  { id: 'uploads', label: '⬆ Uploads', href: undefined },
                  { id: 'documents', label: '◫ Docs', href: undefined },
                  { id: 'screen-share', label: '▣ Share', href: undefined },
                ].map(item => (
                  item.href ? (
                    <a
                      key={item.id}
                      href={item.href}
                      className="px-4 py-1.5 rounded-lg text-xs transition-all theme-pill"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as View)}
                      className={`px-4 py-1.5 rounded-lg text-xs transition-all ${
                        activeView === item.id ? 'theme-pill-active' : 'theme-pill'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>

            {activeView === 'dashboard' ? (
              <>
                {/* Hero section - AI Orb & Voice */}
                <div className="flex flex-col items-center mb-10">
                  <AIOrb
                    isListening={voice.isListening}
                    onClick={handleOrbClick}
                    size="lg"
                  />
                  <div className="mt-6 text-center">
                    <h1 className="text-lg md:text-xl font-bold text-white neon-text tracking-tight">
                      Nova AI OS
                    </h1>
                    <p className="text-xs text-white/40 mt-1 font-mono">
                      {voice.isListening
                        ? 'Voice recognition active — speak now'
                        : 'Tap the orb or type a message to begin'}
                    </p>
                    <button
                      onClick={handleLaunchShare}
                      className="mt-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200 transition hover:bg-cyan-500/25"
                    >
                      Share screen
                    </button>
                  </div>
                </div>

                {/* HUD Elements */}
                <div className="flex justify-center mb-8">
                  <HUDElements />
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
                  <SystemAnalytics />
                  <WeatherWidget />
                  <CalendarWidget />
                  <NotificationsPanel />
                  <SmartHomePanel />
                  <CodingAssistant />
                  <div className="md:col-span-2 xl:col-span-1">
                    <NewsFeed />
                  </div>
                  {/* Chat panel in dashboard view */}
                  <div className="md:col-span-2 xl:col-span-2">
                    <ChatPanel files={uploadedFiles} onLaunchShare={handleLaunchShare} />
                  </div>
                </div>
              </>
            ) : activeView === 'chat' ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center mb-8">
                  <AIOrb
                    isListening={voice.isListening}
                    isTyping={false}
                    onClick={handleOrbClick}
                    size="md"
                  />
                  {voice.isListening && (
                    <div className="mt-4 w-full max-w-md">
                      <VoiceWaveform isActive={true} amplitude={voice.amplitude} />
                    </div>
                  )}
                </div>
                <ChatPanel files={uploadedFiles} onLaunchShare={handleLaunchShare} />
              </div>
            ) : (
              <WorkspaceModules activeView={activeView} files={uploadedFiles} onFilesChange={handleFilesChange} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
