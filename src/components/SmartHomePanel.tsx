'use client';

import { useState } from 'react';
import { smartDevices as initialDevices } from '@/data/mockData';
import type { SmartDevice } from '@/types';

const deviceIcons: Record<string, { on: string; off: string }> = {
  light: { on: '💡', off: '💡' },
  thermostat: { on: '🌡️', off: '🌡️' },
  lock: { on: '🔒', off: '🔓' },
  camera: { on: '📷', off: '📷' },
  speaker: { on: '🔊', off: '🔇' },
  plug: { on: '🔌', off: '🔌' },
};

const deviceColors: Record<string, string> = {
  light: '#ffd740',
  thermostat: '#00e5ff',
  lock: '#00e676',
  camera: '#7c4dff',
  speaker: '#ff4081',
  plug: '#ff6d00',
};

export default function SmartHomePanel() {
  const [devices, setDevices] = useState(initialDevices);

  const toggleDevice = (id: string) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        if (d.type === 'lock') {
          return { ...d, status: d.status === 'locked' ? 'unlocked' : 'locked' };
        }
        return { ...d, status: d.status === 'on' ? 'off' : 'on' };
      })
    );
  };

  const onCount = devices.filter(d => d.status === 'on' || d.status === 'locked').length;

  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Smart Home</h3>
          <span className="text-[10px] text-emerald-400/60">{onCount} active</span>
        </div>
        <span className="text-[10px] text-white/30">{devices.length} devices</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {devices.map(device => {
          const isOn = device.status === 'on' || device.status === 'locked';
          const color = deviceColors[device.type] || '#00e5ff';

          return (
            <button
              key={device.id}
              onClick={() => toggleDevice(device.id)}
              className={`relative p-3 rounded-xl text-left transition-all duration-300 group ${
                isOn
                  ? 'bg-white/[0.05] border border-white/[0.08]'
                  : 'bg-white/[0.02] border border-transparent'
              } hover:bg-white/[0.08]`}
              style={{
                boxShadow: isOn ? `0 0 20px ${color}15` : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg" style={{ filter: isOn ? 'none' : 'grayscale(0.8)' }}>
                  {(deviceIcons[device.type] || { on: '📱', off: '📱' })[isOn ? 'on' : 'off']}
                </span>
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isOn ? 'shadow-[0_0_6px]' : 'bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isOn ? color : undefined,
                    boxShadow: isOn ? `0 0 6px ${color}` : undefined,
                  }}
                />
              </div>
              <div className="text-xs font-medium text-white/70 truncate group-hover:text-white transition-colors">
                {device.name}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">{device.room}</div>
              {device.value !== undefined && (
                <div className="text-[10px] font-mono text-cyan-400/60 mt-1">
                  {device.value}°C
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
