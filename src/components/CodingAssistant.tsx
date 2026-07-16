'use client';

import { useState } from 'react';
import { codeSnippets } from '@/data/mockData';

export default function CodingAssistant() {
  const [activeSnippet, setActiveSnippet] = useState(0);
  const [copied, setCopied] = useState(false);

  const snippet = codeSnippets[activeSnippet];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = snippet.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-5 animate-fadeInUp stagger-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Code Assistant</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">AI</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-[10px] px-2 py-1 rounded text-white/30 hover:text-cyan-300 hover:bg-white/5 transition-all"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 mb-3">
        {codeSnippets.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSnippet(i)}
            className={`text-[10px] px-2.5 py-1.5 rounded-lg transition-all font-mono ${
              i === activeSnippet
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent'
            }`}
          >
            {s.language}
          </button>
        ))}
      </div>

      {/* Snippet description */}
      <p className="text-[10px] text-white/40 mb-2">{snippet.description}</p>

      {/* Code block */}
      <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span className="ml-2 text-[9px] font-mono text-white/20">{snippet.language}</span>
        </div>
        <pre className="p-3 text-xs font-mono leading-relaxed overflow-x-auto">
          <code className="text-cyan-300/80">
            {snippet.code.split('\n').map((line, i) => (
              <div key={i} className="whitespace-pre">
                <span className="text-white/15 select-none mr-4 inline-block w-5 text-right">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
