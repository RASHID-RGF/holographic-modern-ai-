'use client';

import { useState, useEffect } from 'react';
import { SystemStats } from '@/types';
import { systemStats } from '@/data/mockData';

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats>(systemStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.round(Math.random() * 40 + 10),
        ram: Math.round(Math.random() * 30 + 20),
        gpu: Math.round(Math.random() * 30 + 15),
        ramUsed: +(Math.random() * 8 + 2).toFixed(1),
        network: {
          download: +(Math.random() * 80 + 10).toFixed(1),
          upload: +(Math.random() * 25 + 2).toFixed(1),
        },
        processes: Math.round(Math.random() * 100 + 120),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
