'use client';

import { useEffect, useState } from 'react';

interface AIOrbProps {
  isListening?: boolean;
  isTyping?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function AIOrb({ isListening, isTyping, onClick, size = 'lg' }: AIOrbProps) {
  const [rotation, setRotation] = useState(0);

  const sizes = {
    sm: { orb: 48, ring: 64, outer: 80 },
    md: { orb: 80, ring: 110, outer: 140 },
    lg: { orb: 120, ring: 160, outer: 200 },
  };

  const s = sizes[size];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer group"
      onClick={onClick}
      style={{ width: s.outer, height: s.outer }}
    >
      {/* Outer glow rings */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: s.outer,
          height: s.outer,
          background: `conic-gradient(from ${rotation}deg, transparent, rgba(0, 229, 255, 0.1), transparent, rgba(124, 77, 255, 0.1), transparent)`,
          filter: 'blur(2px)',
        }}
      />

      {/* Middle ring */}
      <div
        className="absolute rounded-full animate-spin-slow"
        style={{
          width: s.ring,
          height: s.ring,
          border: '1px solid rgba(0, 229, 255, 0.2)',
          background: `conic-gradient(from ${rotation * 2}deg, transparent 60%, rgba(0, 229, 255, 0.3), rgba(124, 77, 255, 0.2), transparent)`,
          transform: `rotate(${rotation}deg)`,
        }}
      />

      {/* Inner ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: s.ring + 20,
          height: s.ring + 20,
          border: '1px solid rgba(0, 229, 255, 0.08)',
          transform: `rotate(-${rotation * 1.5}deg)`,
        }}
      />

      {/* Orb core */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: s.orb,
          height: s.orb,
          background: `radial-gradient(circle at 35% 35%, 
            ${isListening ? '#00e5ff' : '#1a2a6c'}, 
            ${isTyping ? '#7c4dff' : '#0a0a30'}, 
            #050510)`,
          boxShadow: `0 0 ${s.orb * 0.3}px rgba(0, 229, 255, ${isListening ? 0.6 : 0.3}),
                      0 0 ${s.orb * 0.6}px rgba(0, 229, 255, ${isListening ? 0.3 : 0.1})`,
          transition: 'all 0.5s ease',
        }}
      >
        {/* Core glow */}
        <div
          className="absolute rounded-full animate-breath"
          style={{
            width: s.orb * 0.7,
            height: s.orb * 0.7,
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.4), transparent)',
            filter: 'blur(8px)',
          }}
        />

        {/* AI icon */}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10"
          style={{
            width: s.orb * 0.35,
            height: s.orb * 0.35,
          }}
        >
          <defs>
            <linearGradient id="ai-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#7c4dff" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="url(#ai-icon-grad)"
            className="drop-shadow-lg"
          />
        </svg>

        {/* Pulse rings */}
        {isListening && (
          <>
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: s.orb * 1.5,
                height: s.orb * 1.5,
                border: '2px solid rgba(0, 229, 255, 0.3)',
              }}
            />
            <div
              className="absolute rounded-full animate-pulse-ring"
              style={{
                width: s.orb * 2,
                height: s.orb * 2,
                border: '1px solid rgba(0, 229, 255, 0.15)',
                animationDelay: '0.5s',
              }}
            />
          </>
        )}
      </div>

      {/* Hover tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] text-cyan-300/60 whitespace-nowrap">
        {isListening ? 'Listening...' : isTyping ? 'Processing...' : 'Click to interact'}
      </div>
    </div>
  );
}
