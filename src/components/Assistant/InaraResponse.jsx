// src/components/Assistant/InaraResponse.jsx
import { useMemo } from 'react';

const T = {
  orange:      '#ff782d',
  orangeDim:   'rgba(255,120,45,0.08)',
  orangeBorder:'rgba(255,120,45,0.15)',
  navy:        '#081422',
  white:       '#ffffff',
  text:        '#334155', // slate-700
  textMuted:   '#64748b', // slate-500
  textDim:     '#94a3b8', // slate-400
  bgCard:      '#ffffff',
  bgCodeBg:    '#f8fafc', // slate-50
  border:      '#f1f5f9', // slate-100
  borderStrong:'#e2e8f0', // slate-200
  success:     '#10b981', // emerald-500
  successDim:  'rgba(16,185,129,0.06)',
  warning:     '#f59e0b', // amber-500
  warningDim:  'rgba(245,158,11,0.06)',
  danger:      '#ef4444', // red-500
  dangerDim:   'rgba(239,68,68,0.06)',
  info:        '#3b82f6', // blue-500
  infoDim:     'rgba(59,130,246,0.06)',
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
      parts.push(<strong key={m.index} style={{ fontWeight: 700, color: '#000' }}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      parts.push(<em key={m.index} style={{ fontStyle: 'italic', color: T.textMuted }}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      parts.push(
        <code key={m.index} style={{
          fontFamily: "monospace",
          fontSize: '12px',
          background: 'rgba(0,0,0,0.04)',
          color: '#e11d48',
          padding: '1px 5px',
          borderRadius: '4px',
        }}>{m[4]}</code>
      );
    } else if (m[5] !== undefined) {
      parts.push(
        <mark key={m.index} style={{
          background: '#fef3c7',
          color: '#92400e',
          padding: '1px 3px',
          borderRadius: '3px',
        }}>{m[5]}</mark>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? text : parts;
}

function RenderH1({ content }) { return <div style={{ fontSize: '22px', fontWeight: 900, color: '#000', margin: '20px 0 10px', letterSpacing: '-0.5px' }}>{parseInline(content)}</div>; }
function RenderH2({ content }) { return <div style={{ fontSize: '18px', fontWeight: 800, color: '#000', margin: '18px 0 8px', letterSpacing: '-0.3px' }}>{parseInline(content)}</div>; }
function RenderH3({ content }) { return <div style={{ fontSize: '15px', fontWeight: 700, color: '#000', margin: '14px 0 6px' }}>{parseInline(content)}</div>; }
function RenderParagraph({ content }) { return <p style={{ fontSize: '14px', lineHeight: '1.7', color: T.text, margin: '0 0 12px' }}>{parseInline(content)}</p>; }

function RenderUL({ items }) {
  return (
    <ul style={{ margin: '4px 0 12px', paddingLeft: '4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ fontSize: '14px', color: T.text, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.orange, marginTop: '7px', flexShrink: 0 }} />
          <span>{parseInline(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function RenderOL({ items }) {
  return (
    <ol style={{ margin: '4px 0 12px', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ fontSize: '14px', color: T.text, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '6px', 
            background: T.orange, 
            color: '#fff', 
            fontSize: '11px', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginTop: '1px',
            flexShrink: 0 
          }}>{idx + 1}</span>
          <span style={{ lineHeight: '1.6' }}>{parseInline(item)}</span>
        </li>
      ))}
    </ol>
  );
}

function RenderCode({ lang, content }) {
  return (
    <div style={{ margin: '12px 0', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${T.borderStrong}`, background: '#081422' }}>
      {lang && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{lang}</span>
        </div>
      )}
      <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontSize: '13px', lineHeight: '1.6', color: '#fff', fontFamily: "monospace" }}>{content}</pre>
    </div>
  );
}

function RenderCallout({ type, content }) {
  const cfg = {
    warning: { color: T.warning, bg: T.warningDim, icon: '⚠️' },
    info:    { color: T.info,    bg: T.infoDim,    icon: 'ℹ️' },
    success: { color: T.success, bg: T.successDim, icon: '✅' },
    danger:  { color: T.danger,  bg: T.dangerDim,  icon: '🚫' },
  }[type] || { color: T.textMuted, bg: T.border, icon: '•' };

  return (
    <div style={{
      margin: '12px 0',
      padding: '14px 16px',
      background: cfg.bg,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: '8px',
      display: 'flex',
      gap: '12px',
    }}>
      <span style={{ fontSize: '16px', marginTop: '-1px' }}>{cfg.icon}</span>
      <div style={{ fontSize: '13.5px', lineHeight: '1.5', color: T.text }}>{parseInline(content)}</div>
    </div>
  );
}

function RenderDivider() {
  return <div style={{ height: '1px', width: '100%', background: `linear-gradient(90deg, transparent, ${T.borderStrong}, transparent)`, margin: '20px 0' }} />;
}

function RenderKV({ label, value }) {
    return (
        <div style={{ 
            background: '#fff', 
            border: `1px solid ${T.border}`, 
            borderRadius: '8px', 
            padding: '10px 14px', 
            margin: '8px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>{parseInline(value)}</span>
        </div>
    );
}

function parseBlocks(raw) {
  if (!raw) return [];
  const lines = raw.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    // Callouts
    const calloutMatch = line.match(/^>\s*!(warning|info|success|danger)\s+(.*)/i);
    if (calloutMatch) {
      blocks.push({ type: 'callout', calloutType: calloutMatch[1].toLowerCase(), content: calloutMatch[2] });
      i++; continue;
    }

    // Dividers
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({ type: 'divider' });
      i++; continue;
    }

    // Code
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

    // Key-value pairs (Label: value)
    const kvMatch = line.match(/^\*\*(.+?)\*\*:\s*(.*)/);
    if (kvMatch) {
        blocks.push({ type: 'kv', label: kvMatch[1], value: kvMatch[2] });
        i++; continue;
    }

    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !/^[-*•]\s/.test(lines[i].trim()) && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith('>')) {
      para += (para ? ' ' : '') + lines[i].trim();
      i++;
    }
    if (para) blocks.push({ type: 'p', content: para });
  }
  return blocks;
}

export default function InaraResponse({ content, onSuggestionsFound }) {
  const { filteredContent, suggestions } = useMemo(() => {
    if (!content) return { filteredContent: '', suggestions: [] };
    let suggestions = [];
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      const match = line.trim().match(/^SUGGESTIONS:\s*(\[.*\])/i);
      if (match) { try { suggestions = JSON.parse(match[1]); return false; } catch (e) {} }
      return true;
    });
    return { filteredContent: filteredLines.join('\n').trim(), suggestions };
  }, [content]);

  const blocks = useMemo(() => parseBlocks(filteredContent), [filteredContent]);

  useMemo(() => {
    if (suggestions.length > 0 && onSuggestionsFound) onSuggestionsFound(suggestions);
  }, [suggestions, onSuggestionsFound]);

  if (!blocks.length) return null;
  return (
    <div className="inara-rich-response">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':      return <RenderH1 key={idx} content={block.content} />;
          case 'h2':      return <RenderH2 key={idx} content={block.content} />;
          case 'h3':      return <RenderH3 key={idx} content={block.content} />;
          case 'p':       return <RenderParagraph key={idx} content={block.content} />;
          case 'ul':      return <RenderUL key={idx} items={block.items} />;
          case 'ol':      return <RenderOL key={idx} items={block.items} />;
          case 'code':    return <RenderCode key={idx} lang={block.lang} content={block.content} />;
          case 'callout': return <RenderCallout key={idx} type={block.calloutType} content={block.content} />;
          case 'divider': return <RenderDivider key={idx} />;
          case 'kv':      return <RenderKV key={idx} label={block.label} value={block.value} />;
          default:        return null;
        }
      })}
    </div>
  );
}