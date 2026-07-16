'use client';

import { useState, useMemo } from 'react';
import { calendarEvents } from '@/data/mockData';

const typeColors: Record<string, string> = {
  meeting: '#00e5ff',
  event: '#ff4081',
  task: '#00e676',
  reminder: '#ffd740',
};

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const { today, daysInMonth, firstDay, todayEvents } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const first = new Date(year, month, 1).getDay();
    const events = calendarEvents.filter(
      e => new Date(e.date).toDateString() === now.toDateString()
    );
    return {
      today: now,
      daysInMonth: days,
      firstDay: first,
      todayEvents: events,
    };
  }, []);

  const monthYear = today.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/80">Calendar</h3>
        <span className="text-[10px] text-white/30">{monthYear}</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            className="text-center text-[10px] text-white/30 font-mono py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          const isSelected = day === selectedDate;
          const hasEvent = calendarEvents.some(
            e =>
              new Date(e.date).getDate() === day &&
              new Date(e.date).getMonth() === today.getMonth()
          );

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`relative text-center text-xs py-1.5 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  : isToday
                  ? 'text-white bg-white/5'
                  : 'text-white/50 hover:bg-white/5'
              }`}
            >
              {day}
              {hasEvent && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Today's events */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-white/30 mb-2">
          <div className="w-1 h-1 rounded-full bg-cyan-400" />
          Today&apos;s Schedule
        </div>
        {todayEvents.map(event => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors group cursor-pointer"
          >
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: typeColors[event.type] || '#00e5ff' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/80 truncate group-hover:text-white transition-colors">
                {event.title}
              </div>
              <div className="text-[10px] text-white/30 font-mono">
                {event.time} · {event.duration}
              </div>
            </div>
            <div className="text-[10px] text-white/20 capitalize">
              {event.type}
            </div>
          </div>
        ))}
        {todayEvents.length === 0 && (
          <div className="text-[11px] text-white/20 text-center py-2">
            No events today
          </div>
        )}
      </div>
    </div>
  );
}
