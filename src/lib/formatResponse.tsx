import React from 'react';

// Emoji picker based on keywords in the text
function pickEmoji(text: string): string {
  const lower = text.toLowerCase();

  if (/feature|capabilit|function|support/i.test(lower)) return '✨';
  if (/design|ui|layout|color|visual|theme|style|interface/i.test(lower)) return '🎨';
  if (/code|function|api|endpoint|route|server|database|app/i.test(lower)) return '💻';
  if (/error|issue|bug|problem|warn|fail|fix/i.test(lower)) return '⚡';
  if (/success|complete|done|finish|ready|accomplish/i.test(lower)) return '✅';
  if (/step|instruction|guide|tutorial|how.to|follow/i.test(lower)) return '📋';
  if (/tip|note|info|hint|advi|suggest|remember/i.test(lower)) return '💡';
  if (/data|stat|number|metric|analytics|chart|graph|count/i.test(lower)) return '📊';
  if (/file|document|pdf|folder|archive/i.test(lower)) return '📄';
  if (/image|screenshot|photo|picture|snapshot|screen|capture/i.test(lower)) return '🖼️';
  if (/link|url|website|page|browser/i.test(lower)) return '🔗';
  if (/time|date|schedule|deadline|calendar|clock|hour/i.test(lower)) return '🕐';
  if (/user|person|team|people|member|profile|account/i.test(lower)) return '👤';
  if (/chat|message|talk|conversation|communicate|speak/i.test(lower)) return '💬';
  if (/search|find|lookup|query|explore|discover/i.test(lower)) return '🔍';
  if (/idea|think|concept|brainstorm|creative|innovate/i.test(lower)) return '💭';
  if (/secure|privacy|protect|safe|permission|access/i.test(lower)) return '🔒';
  if (/price|cost|budget|payment|plan|subscription|free/i.test(lower)) return '💰';
  if (/email|mail|inbox|message|send/i.test(lower)) return '📧';
  if (/ai|machine.learn|model|neural|intelligen|learn/i.test(lower)) return '🧠';
  if (/setting|preference|config|option|customize/i.test(lower)) return '⚙️';
  if (/notification|alert|remind|ping|bell/i.test(lower)) return '🔔';
  if (/music|audio|sound|voice|speak|listen|mic|record/i.test(lower)) return '🎵';
  if (/home|smart|device|iot|light|thermostat/i.test(lower)) return '🏠';
  if (/weather|temperature|forecast|sun|rain|cloud/i.test(lower)) return '🌤️';

  return '';
}

// Colour generator for section labels based on text hash
const SECTION_COLORS = [
  { bg: 'rgba(0, 229, 255, 0.12)', text: 'rgb(0, 229, 255)', dot: '#00e5ff' },    // cyan
  { bg: 'rgba(124, 77, 255, 0.12)', text: 'rgb(180, 140, 255)', dot: '#7c4dff' },   // violet
  { bg: 'rgba(255, 64, 129, 0.12)', text: 'rgb(255, 120, 170)', dot: '#ff4081' },   // pink
  { bg: 'rgba(0, 230, 118, 0.12)', text: 'rgb(80, 240, 150)', dot: '#00e676' },     // green
  { bg: 'rgba(255, 215, 64, 0.12)', text: 'rgb(255, 225, 120)', dot: '#ffd740' },   // amber
  { bg: 'rgba(41, 121, 255, 0.12)', text: 'rgb(100, 170, 255)', dot: '#2979ff' },   // blue
  { bg: 'rgba(255, 87, 34, 0.12)', text: 'rgb(255, 150, 100)', dot: '#ff5722' },    // orange
];

function getSectionColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) - hash) + label.charCodeAt(i);
    hash |= 0;
  }
  return SECTION_COLORS[Math.abs(hash) % SECTION_COLORS.length];
}

// Check if a line looks like a section header (short description ending with colon)
function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.endsWith(':')) return false;
  if (trimmed.length > 50) return false;
  // Exclude common sentence endings
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('here') || lower.startsWith('here are') || lower.startsWith('here is')) return false;
  if (lower.startsWith('for') || lower.startsWith('please') || lower.startsWith('this is')) return false;
  return true;
}

// Check if a line is a numbered list item
function isNumberedItem(line: string): string | null {
  const match = line.trim().match(/^(\d+)[\.\)]\s*(.+)/);
  return match ? match[1] : null;
}

// Check if line is a bullet point
function isBulletItem(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
    return trimmed.replace(/^[-•*]\s*/, '');
  }
  return null;
}

// Main formatter — returns React nodes array
export function renderFormattedContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  // Check if content has any structured elements
  const hasBullets = lines.some(l => isBulletItem(l) !== null);
  const hasNumbered = lines.some(l => isNumberedItem(l) !== null);
  const hasSections = lines.some(l => isSectionHeader(l));

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const key = `line-${i}`;

    // Empty line - spacer
    if (!trimmed) {
      nodes.push(<div key={key} className="h-2" />);
      return;
    }

    // Bullet item
    const bulletText = isBulletItem(trimmed);
    if (bulletText) {
      const emoji = pickEmoji(bulletText);
      const color = getSectionColor(bulletText.slice(0, 10));
      nodes.push(
        <div key={key} className="flex items-start gap-2.5 my-1">
          <span style={{ color: color.dot }} className="text-sm mt-0.5 flex-shrink-0 leading-5">
            {emoji || '•'}
          </span>
          <span className="text-sm leading-relaxed text-white/80">{bulletText}</span>
        </div>
      );
      return;
    }

    // Numbered item
    const num = isNumberedItem(trimmed);
    if (num && (hasBullets || hasNumbered)) {
      const text = trimmed.replace(/^\d+[\.\)]\s*/, '');
      const contentColor = getSectionColor(text.slice(0, 10));
      nodes.push(
        <div key={key} className="flex items-start gap-2.5 my-1">
          <span
            className="text-[11px] font-semibold mt-0.5 flex-shrink-0 leading-5 rounded-full flex items-center justify-center"
            style={{
              width: 20,
              height: 20,
              backgroundColor: contentColor.bg,
              color: contentColor.text,
            }}
          >
            {num}
          </span>
          <span className="text-sm leading-relaxed text-white/80">{text}</span>
        </div>
      );
      return;
    }

    // Section header
    if (hasSections && isSectionHeader(trimmed)) {
      const labelText = trimmed.endsWith(':') ? trimmed.slice(0, -1) : trimmed;
      const emoji = pickEmoji(labelText);
      const color = getSectionColor(labelText);
      nodes.push(
        <div key={key} className="flex items-center gap-2 my-2.5">
          {emoji && <span className="text-sm">{emoji}</span>}
          <span
            className="text-xs font-semibold tracking-wide rounded-full px-3 py-1"
            style={{
              backgroundColor: color.bg,
              color: color.text,
            }}
          >
            {labelText}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: color.bg }} />
        </div>
      );
      return;
    }

    // Regular paragraph
    nodes.push(
      <p key={key} className="text-sm leading-relaxed text-white/80 my-1">
        {trimmed}
      </p>
    );
  });

  return nodes;
}
