'use client';

import { useState, useEffect } from 'react';

function AnimatedRing({ size, label, value, color }: { size: number; label: string; value: number; color: string }) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Rotating arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={`${color}10`}
            strokeWidth="1"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * Math.PI * (size - 4)} ${Math.PI * (size - 4)}`}
            className="transition-all duration-1000"
            filter="url(#hudGlow)"
          />
          <defs>
            <filter id="hudGlow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {/* Inner content */}
        <div className="text-center">
          <div className="text-[8px] font-mono" style={{ color }}>{value}%</div>
        </div>
      </div>
      <span className="text-[7px] font-mono text-white/30">{label}</span>
    </div>
  );
}

export default function HUDElements() {
  return (
    <div className="flex items-center gap-4 p-3 glass-panel-light animate-fadeInUp">
      <AnimatedRing size={48} label="SYSTEM" value={87} color="#00e5ff" />
      <AnimatedRing size={48} label="NETWORK" value={92} color="#00e676" />
      <AnimatedRing size={48} label="SECURITY" value={76} color="#ffd740" />
      <AnimatedRing size={48} label="MEMORY" value={45} color="#7c4dff" />

      {/* Separator */}
      <div className="w-px h-10 bg-white/5" />

      {/* Status indicators */}
      <div className="flex flex-col gap-1.5 text-[8px] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/60">AI CORE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-400/60">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-violet-400/60">SECURE</span>
        </div>
      </div>
    </div>
  );
}
