// src/components/Assistant/InaraResponse.jsx
import { useMemo } from 'react';

// ─── Design tokens adapted for Inara's Light Bubble ────────────────
const T = {
  orange:      '#ff782d',
  orangeDim:   'rgba(255,120,45,0.08)',
  orangeBorder:'rgba(255,120,45,0.2)',
  navy:        '#081422',
  white:       '#ffffff',
  text:        '#1e293b', // slate-800
  textMuted:   '#475569', // slate-600
  textDim:     '#94a3b8', // slate-400
  bgCard:      '#ffffff',
  bgCodeBg:    '#f1f5f9', // slate-100
  border:      '#e2e8f0', // slate-200
  borderStrong:'#cbd5e1', // slate-300
  success:     '#10b981', // emerald-500
  successDim:  'rgba(16,185,129,0.08)',
  warning:     '#f59e0b', // amber-500
  warningDim:  'rgba(245,158,11,0.08)',
  danger:      '#ef4444', // red-500
  dangerDim:   'rgba(239,68,68,0.08)',
  info:        '#3b82f6', // blue-500
  infoDim:     'rgba(59,130,246,0.08)',
};

function parseInline(text) {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|==(.+?)==)/g;
  let last = 0;
  let m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      parts.push(<strong key={m.index} style={{ fontWeight: 800, color: T.navy }}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={m.index} style={{ fontStyle: 'italic', color: T.textMuted }}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      parts.push(
        <code key={m.index} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          background: T.bgCodeBg,
          color: T.orange,
          padding: '2px 6px',
          borderRadius: '5px',
          border: `1px solid ${T.border}`,
        }}>{m[4]}</code>
      );
    } else if (m[5] !== undefined) {
      parts.push(
        <mark key={m.index} style={{
          background: T.orangeDim,
          color: T.orange,
          padding: '1px 4px',
          borderRadius: '4px',
          fontWeight: 700,
        }}>{m[5]}</mark>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? text : parts;
}

function parseBlocks(raw) {
  if (!raw) return [];
  const lines = raw.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    if (line.trim() === '```json') {
      i++;
      while (i < lines.length && lines[i].trim() !== '```') i++;
      i++;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      let code = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }
      i++;
      blocks.push({ type: 'code', lang, content: code.trimEnd() });
      continue;
    }

    if (/^[-*]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (/^>\s*!(warning|info|success|danger)\s+/i.test(line.trim())) {
      const match = line.trim().match(/^>\s*!(warning|info|success|danger)\s+(.+)/i);
      blocks.push({ type: 'callout', variant: match[1].toLowerCase(), content: match[2] });
      i++;
      continue;
    }

    if (line.trim().startsWith('> ')) {
      let content = '';
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        content += lines[i].trim().slice(2) + ' ';
        i++;
      }
      blocks.push({ type: 'quote', content: content.trim() });
      continue;
    }

    if (line.startsWith('# ')) { blocks.push({ type: 'h1', content: line.slice(2) }); i++; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', content: line.slice(3) }); i++; continue; }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', content: line.slice(4) }); i++; continue; }

    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (/^[-*•]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s/, '').trim());
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\*\*[^*]+\*\*:/.test(line.trim())) {
      const kvItems = [];
      while (i < lines.length && /^\*\*[^*]+\*\*:/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^\*\*([^*]+)\*\*:\s*(.*)/);
        if (match) kvItems.push({ key: match[1], value: match[2] });
        i++;
      }
      if (kvItems.length > 1) {
        blocks.push({ type: 'kv', items: kvItems });
        continue;
      } else {
        blocks.push({ type: 'p', content: lines[i - 1] });
        continue;
      }
    }

    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !/^[-*•]\s/.test(lines[i].trim()) && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith('> ') && !/^[-*]{3,}$/.test(lines[i].trim())) {
      para += (para ? ' ' : '') + lines[i].trim();
      i++;
    }
    if (para) blocks.push({ type: 'p', content: para });
  }
  return blocks;
}

function RenderH1({ content }) {
  return <div style={{ fontSize: '18px', fontWeight: 900, color: T.navy, letterSpacing: '-0.02em', margin: '20px 0 10px', textTransform: 'uppercase', fontFamily: "'Metropolis', sans-serif" }}>{parseInline(content)}</div>;
}
function RenderH2({ content }) {
  return <div style={{ fontSize: '15px', fontWeight: 800, color: T.orange, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '18px 0 8px' }}>{parseInline(content)}</div>;
}
function RenderH3({ content }) {
  return <div style={{ fontSize: '14px', fontWeight: 700, color: T.navy, margin: '14px 0 6px' }}>{parseInline(content)}</div>;
}
function RenderParagraph({ content }) {
  return <p style={{ fontSize: '14px', lineHeight: '1.7', color: T.text, margin: '0 0 12px' }}>{parseInline(content)}</p>;
}
function RenderUL({ items }) {
  return <ul style={{ margin: '4px 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {items.map((item, idx) => (
      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: T.text }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.orange, flexShrink: 0, marginTop: '8px' }} />
        <span>{parseInline(item)}</span>
      </li>
    ))}
  </ul>;
}
function RenderOL({ items }) {
  return <ol style={{ margin: '4px 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {items.map((item, idx) => (
      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: T.text }}>
        <span style={{ minWidth: '22px', height: '22px', borderRadius: '7px', background: T.orangeDim, border: `1px solid ${T.orangeBorder}`, color: T.orange, fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{idx + 1}</span>
        <span style={{ paddingTop: '2px' }}>{parseInline(item)}</span>
      </li>
    ))}
  </ol>;
}
function RenderCode({ lang, content }) {
  return <div style={{ margin: '10px 0 16px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
    {lang && <div style={{ background: T.bgCodeBg, padding: '6px 14px', fontSize: '10px', fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>{lang}</div>}
    <pre style={{ margin: 0, padding: '14px', background: '#fafafa', overflowX: 'auto', fontSize: '12.5px', lineHeight: '1.6', color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>{content}</pre>
  </div>;
}

const CALLOUT_STYLES = {
  warning: { bg: T.warningDim, border: 'rgba(245,158,11,0.2)', icon: '⚠️', color: T.warning },
  info:    { bg: T.infoDim,    border: 'rgba(59,130,246,0.2)',  icon: 'ℹ️', color: T.info },
  success: { bg: T.successDim, border: 'rgba(16,185,129,0.2)', icon: '✅', color: T.success },
  danger:  { bg: T.dangerDim,  border: 'rgba(239,68,68,0.2)',   icon: '🛑', color: T.danger },
};

function RenderCallout({ variant, content }) {
  const s = CALLOUT_STYLES[variant] || CALLOUT_STYLES.info;
  return <div style={{ display: 'flex', gap: '12px', background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.color}`, borderRadius: '10px', padding: '12px 16px', margin: '12px 0', alignItems: 'flex-start' }}>
    <span style={{ fontSize: '16px', flexShrink: 0 }}>{s.icon}</span>
    <span style={{ fontSize: '13.5px', lineHeight: '1.6', color: T.text, fontWeight: 500 }}>{parseInline(content)}</span>
  </div>;
}

function RenderQuote({ content }) {
  return <div style={{ borderLeft: `3px solid ${T.orangeBorder}`, paddingLeft: '16px', margin: '12px 0', color: T.textMuted, fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6' }}>{parseInline(content)}</div>;
}
function RenderHR() {
  return <div style={{ height: '1px', background: `linear-gradient(90deg, ${T.border}, transparent)`, margin: '18px 0' }} />;
}
function RenderKV({ items }) {
  return <div style={{ background: '#f8fafc', border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden', margin: '12px 0 16px shadow-sm' }}>
    {items.map((item, idx) => (
      <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '10px 16px', borderBottom: idx < items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '100px', flexShrink: 0 }}>{item.key}</span>
        <span style={{ fontSize: '13.5px', color: T.text, lineHeight: '1.5' }}>{parseInline(item.value)}</span>
      </div>
    ))}
  </div>;
}

export default function InaraResponse({ content }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  if (!blocks.length) return null;
  return <div className="inara-rich-response" style={{ fontFamily: "inherit", color: T.text, maxWidth: '100%' }}>
    {blocks.map((block, idx) => {
      switch (block.type) {
        case 'h1':      return <RenderH1      key={idx} content={block.content} />;
        case 'h2':      return <RenderH2      key={idx} content={block.content} />;
        case 'h3':      return <RenderH3      key={idx} content={block.content} />;
        case 'p':       return <RenderParagraph key={idx} content={block.content} />;
        case 'ul':      return <RenderUL      key={idx} items={block.items} />;
        case 'ol':      return <RenderOL      key={idx} items={block.items} />;
        case 'code':    return <RenderCode    key={idx} lang={block.lang} content={block.content} />;
        case 'callout': return <RenderCallout key={idx} variant={block.variant} content={block.content} />;
        case 'quote':   return <RenderQuote   key={idx} content={block.content} />;
        case 'hr':      return <RenderHR      key={idx} />;
        case 'kv':      return <RenderKV      key={idx} items={block.items} />;
        default:        return null;
      }
    })}
  </div>;
}
