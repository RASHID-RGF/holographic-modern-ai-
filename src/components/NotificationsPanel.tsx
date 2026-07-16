'use client';

import { useState } from 'react';
import { notifications } from '@/data/mockData';

const typeIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  social: '💬',
};

const typeColors: Record<string, string> = {
  info: '#00e5ff',
  success: '#00e676',
  warning: '#ffd740',
  error: '#ff1744',
  social: '#7c4dff',
};

export default function NotificationsPanel() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<string>('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[10px] text-cyan-400/50 hover:text-cyan-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {['all', 'info', 'success', 'warning', 'error', 'social'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-[10px] px-2 py-1 rounded-full transition-all ${
              filter === t
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filtered.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-2.5 rounded-lg transition-all cursor-pointer group ${
              n.read ? 'opacity-60 hover:opacity-100' : 'bg-white/[0.03]'
            } hover:bg-white/[0.06]`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${typeColors[n.type]}15` }}
            >
              {typeIcons[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${n.read ? 'text-white/60' : 'text-white/90'} truncate group-hover:text-white transition-colors`}>
                  {n.title}
                </span>
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />}
              </div>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">{n.message}</p>
            </div>
            <span className="text-[9px] text-white/20 font-mono flex-shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
