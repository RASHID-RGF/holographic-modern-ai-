'use client';

import { useSystemStats } from '@/hooks/useSystemStats';

function Gauge({ label, value, color, unit = '%' }: { label: string; value: number; color: string; unit?: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <span className="absolute text-lg font-bold" style={{ color }}>
          {value}{unit === '%' ? '%' : unit}
        </span>
      </div>
      <span className="text-xs text-white/40 font-mono">{label}</span>
    </div>
  );
}

export default function SystemAnalytics() {
  const stats = useSystemStats();

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${d}d ${h}h`;
  };

  return (
    <div className="glass-panel p-5 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(0,230,118,0.5)]" />
          <h3 className="text-sm font-semibold text-white/80">System Analytics</h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/50">LIVE</span>
      </div>

      {/* Gauges */}
      <div className="flex justify-around mb-4">
        <Gauge label="CPU" value={stats.cpu} color="#00e5ff" />
        <Gauge label="RAM" value={stats.ram} color="#7c4dff" />
        <Gauge label="GPU" value={stats.gpu} color="#ff4081" />
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex justify-between items-center py-1.5 border-t border-white/5">
          <span className="text-white/40">Memory</span>
          <span className="text-white/70">{stats.ramUsed}GB / {stats.ramTotal}GB</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-t border-white/5">
          <span className="text-white/40">Network ↓↑</span>
          <span className="text-white/70">{stats.network.download} / {stats.network.upload} Mbps</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-t border-white/5">
          <span className="text-white/40">Uptime</span>
          <span className="text-white/70">{formatUptime(stats.uptime)}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-t border-white/5">
          <span className="text-white/40">Processes</span>
          <span className="text-white/70">{stats.processes}</span>
        </div>
      </div>

      {/* Mini sparkline bars */}
      <div className="mt-3 flex items-end gap-[2px] h-8">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${Math.random() * 80 + 20}%`,
              background: `linear-gradient(to top, rgba(0,229,255,${0.2 + Math.random() * 0.4}), rgba(124,77,255,${0.1 + Math.random() * 0.3}))`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
