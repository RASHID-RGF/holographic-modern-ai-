'use client';

import { weather } from '@/data/mockData';

const weatherIcons: Record<string, string> = {
  'sunny': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'rainy': '🌧️',
  'clear': '🌙',
};

export default function WeatherWidget() {
  const data = weather;

  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/80">Weather</h3>
        <span className="text-[10px] text-white/30">{data.city}</span>
      </div>

      {/* Current weather */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.3))' }}>
          {weatherIcons[data.icon] || '🌤️'}
        </span>
        <div>
          <div className="text-3xl font-bold text-white neon-text">{data.temperature}°</div>
          <div className="text-xs text-white/50">{data.condition}</div>
        </div>
        <div className="ml-auto text-right text-xs text-white/40">
          <div>💧 {data.humidity}%</div>
          <div>🌬️ {data.windSpeed} km/h</div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-5 gap-1">
        {data.forecast.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1 py-2 rounded-lg bg-white/[0.03]">
            <span className="text-[10px] font-medium text-white/50">{day.day}</span>
            <span className="text-lg">{weatherIcons[day.icon] || '🌤️'}</span>
            <div className="text-[10px] font-mono">
              <span className="text-white/70">{day.high}°</span>
              <span className="text-white/30 mx-[1px]">/</span>
              <span className="text-white/30">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
