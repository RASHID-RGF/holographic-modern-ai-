'use client';

import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/5">
      {/* Left - Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">NOVA</span>
            <span className="text-[10px] text-cyan-400/50 ml-1 font-mono">v2.4</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(0,230,118,0.5)]" />
          <span className="text-[10px] font-mono text-emerald-400/60">AI CORE ACTIVE</span>
        </div>
      </div>

      {/* Center - Status */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 rounded-sm bg-cyan-400/40" />
            <div className="w-1 h-5 rounded-sm bg-cyan-400/60" />
            <div className="w-1 h-4 rounded-sm bg-cyan-400/50" />
            <div className="w-1 h-6 rounded-sm bg-cyan-400/70" />
            <div className="w-1 h-2 rounded-sm bg-cyan-400/30" />
          </div>
          <span>SECURE CONNECTION</span>
        </div>
      </div>

      {/* Right - Time & Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-xs font-mono text-white/70">{time}</div>
          <div className="text-[9px] font-mono text-white/30">{date}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-[10px]">🔔</span>
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-[10px]">🌙</span>
          </div>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center cursor-pointer">
            <span className="text-[8px] font-mono text-cyan-300">NV</span>
          </div>
        </div>
      </div>
    </header>
  );
}
