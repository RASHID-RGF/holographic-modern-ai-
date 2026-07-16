'use client';

import { newsFeed } from '@/data/mockData';

export default function NewsFeed() {
  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Live News</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 animate-pulse font-mono">LIVE</span>
        </div>
        <span className="text-[10px] text-white/30">Trending</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {newsFeed.map((news, i) => (
          <div
            key={news.id}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-mono text-cyan-400/50">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 truncate group-hover:text-white transition-colors">
                {news.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-white/30">{news.source}</span>
                <span className="text-[9px] text-white/20">·</span>
                <span className="text-[9px] text-white/20">{news.time}</span>
                <span className="text-[9px] px-1 rounded bg-white/5 text-white/20">{news.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
