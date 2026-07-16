'use client';

import { useState, useEffect } from 'react';

interface VoiceWaveformProps {
  isActive: boolean;
  amplitude?: number;
  barCount?: number;
}

export default function VoiceWaveform({ isActive, amplitude = 0.5, barCount = 32 }: VoiceWaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setHeights(new Array(barCount).fill(2));
      return;
    }

    const interval = setInterval(() => {
      const newHeights = Array.from({ length: barCount }, () => {
        const base = amplitude * 20;
        return Math.max(2, Math.random() * base + 2);
      });
      setHeights(newHeights);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, amplitude, barCount]);

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-[2px] h-10 w-full max-w-[180px] mx-auto">
      {heights.map((height, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            width: '2.5px',
            background: isActive
              ? `linear-gradient(to top, rgba(0, 229, 255, ${0.3 + (height / 20) * 0.4}), rgba(124, 77, 255, ${0.2 + (height / 20) * 0.3}))`
              : 'rgba(255, 255, 255, 0.08)',
            transition: 'height 0.1s ease',
          }}
        />
      ))}
    </div>
  );
}
