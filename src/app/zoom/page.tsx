'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

export default function ZoomPage() {
  const router = useRouter();
  const voice = useVoiceRecognition();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden theme-shell select-none">
      {/* Deep background */}
      <div className="fixed inset-0" style={{ backgroundColor: 'var(--bg-deep)' }} />
      <div className="fixed inset-0 bg-grid opacity-20" />
      <div className="fixed inset-0 aurora-gradient" />
      <ParticleBackground />

      {/* Large ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          background: `
            radial-gradient(ellipse at 40% 50%, rgba(0, 150, 255, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 60% 50%, rgba(124, 77, 255, 0.03) 0%, transparent 60%)
          `,
          filter: 'blur(40px)',
        }}
      />

      {/* Exit button — barely visible until hover */}
      <button
        onClick={() => router.push('/')}
        className="group fixed left-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/20 transition-all hover:text-cyan-300/70 hover:bg-white/[0.03]"
      >
        <svg className="h-2.5 w-2.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Exit
      </button>

      {/* Mic status — subtle dot top-right */}
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2">
        <span
          className={`inline-flex h-1.5 w-1.5 rounded-full transition-all duration-500 ${
            voice.isListening
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(0,230,118,0.4)]'
              : 'bg-white/15'
          }`}
        />
        <span className="text-[9px] uppercase tracking-[0.4em] text-white/15">
          {voice.isListening ? 'Live' : 'Idle'}
        </span>
      </div>

      {/* Main content — redirecting back to the dashboard */}
      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6">
        <div className="glass-panel rounded-3xl border border-white/10 bg-black/40 p-6 text-center text-white/80">
          <p className="text-sm font-semibold">The Zoom feature has been removed.</p>
          <p className="mt-3 text-xs text-white/50">Return to the dashboard and use Screen Share to analyze your display instead.</p>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="fixed bottom-4 z-20">
        <p className="text-[8px] uppercase tracking-[0.6em] text-white/8">
          Nova AI OS
        </p>
      </footer>
    </div>
  );
}
