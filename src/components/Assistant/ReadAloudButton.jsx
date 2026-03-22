// src/components/Assistant/ReadAloudButton.jsx
"use client";

const ORANGE     = '#FF7700';
const ORANGE_DIM = 'rgba(255,119,0,0.12)';
const ORANGE_BOR = 'rgba(255,119,0,0.25)';
const MUTED      = 'rgba(71, 85, 105, 0.5)'; // slate-600 dimmed
const MUTED_BG   = 'rgba(0,0,0,0.02)';
const MUTED_BOR  = 'rgba(0,0,0,0.05)';

function PlayIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );
}

function PauseIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6"  y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
  );
}

function StopIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  );
}

function SoundWave({ color }) {
  return (
    <>
      <style jsx>{`
        @keyframes inaraBar1 { 0%,100%{height:4px} 50%{height:10px} }
        @keyframes inaraBar2 { 0%,100%{height:8px} 50%{height:4px}  }
        @keyframes inaraBar3 { 0%,100%{height:5px} 33%{height:11px} 66%{height:3px} }
        @keyframes inaraBar4 { 0%,100%{height:7px} 50%{height:3px}  }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
        {[
          { anim: 'inaraBar1', delay: '0s' },
          { anim: 'inaraBar2', delay: '0.15s' },
          { anim: 'inaraBar3', delay: '0.05s' },
          { anim: 'inaraBar4', delay: '0.2s' },
        ].map((b, i) => (
          <div key={i} style={{
            width: '2px',
            borderRadius: '2px',
            background: color,
            animation: `${b.anim} 0.7s ease-in-out infinite`,
            animationDelay: b.delay,
          }} />
        ))}
      </div>
    </>
  );
}

export default function ReadAloudButton({ text, id, tts, lang = 'en' }) {
  const { isSupported, isSpeaking, isPaused, activeId, speak, pause, resume, stop } = tts;

  if (!isSupported) return null;

  const isActive  = activeId === id;                     
  const isPlaying = isActive && isSpeaking && !isPaused; 
  const isPausedHere = isActive && isPaused;

  let label, icon, action, color, bg, border;

  if (isPlaying) {
    label  = 'Pause';
    icon   = <PauseIcon />;
    action = pause;
    color  = ORANGE;
    bg     = ORANGE_DIM;
    border = ORANGE_BOR;
  } else if (isPausedHere) {
    label  = 'Resume';
    icon   = <PlayIcon />;
    action = resume;
    color  = ORANGE;
    bg     = ORANGE_DIM;
    border = ORANGE_BOR;
  } else {
    label  = 'Read aloud';
    icon   = <PlayIcon />;
    action = () => speak(text, id, lang);
    color  = MUTED;
    bg     = MUTED_BG;
    border = MUTED_BOR;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <button
        onClick={action}
        title={label}
        aria-label={label}
        className="transition-all active:scale-95"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '12px',
          background: bg,
          border: `1px solid ${border}`,
          color,
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        {isPlaying
          ? <SoundWave color={ORANGE} />
          : <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
        }
        <span>{isPlaying ? 'Speaking' : isPausedHere ? 'Resume' : `Read (${lang.toUpperCase()})`}</span>
      </button>

      {isActive && (
        <button
          onClick={stop}
          title="Stop"
          aria-label="Stop reading"
          className="transition-all active:scale-95"
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'rgba(239,68,68,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <StopIcon />
        </button>
      )}
    </div>
  );
}
