'use client';

import { useState, useEffect } from 'react';

interface VoiceWaveformProps {
  isActive: boolean;
  amplitude?: number;
  barCount?: number;
}

export default function VoiceWaveform({ isActive, amplitude = 0.5, barCount = 48 }: VoiceWaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setHeights(new Array(barCount).fill(2));
      return;
    }

    const interval = setInterval(() => {
      const newHeights = Array.from({ length: barCount }, () => {
        const base = amplitude * 28;
        return Math.max(2, Math.random() * base + 2);
      });
      setHeights(newHeights);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, amplitude, barCount]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full max-w-md mx-auto">
      {heights.map((height, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            width: '3px',
            background: `linear-gradient(to top, 
              ${isActive ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}, 
              ${isActive ? '#7c4dff' : 'rgba(124, 77, 255, 0.1)'})`,
            boxShadow: isActive
              ? `0 0 ${height * 0.5}px rgba(0, 229, 255, 0.4)`
              : 'none',
            transition: 'height 0.1s ease, background 0.3s ease, box-shadow 0.3s ease',
            animationDelay: `${i * 20}ms`,
          }}
        />
      ))}
    </div>
  );
}
