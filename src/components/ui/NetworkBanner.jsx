// src/components/ui/NetworkBanner.jsx
"use client";

import { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../lib/network/useNetworkStatus';

const CONFIG = {
  offline: {
    bg:      '#0f0a0a',
    border:  'rgba(239,68,68,0.4)',
    accent:  '#ef4444',
    icon:    OfflineIcon,
    title:   'No internet connection',
    sub:     'Check your network. Changes may not be saved.',
    pulse:   true,
  },
  poor: {
    bg:      '#0f0d08',
    border:  'rgba(245,158,11,0.35)',
    accent:  '#f59e0b',
    icon:    PoorIcon,
    title:   'Poor connection',
    sub:     'Your network is unstable. Some actions may fail.',
    pulse:   false,
  },
  slow: {
    bg:      '#080f0a',
    border:  'rgba(234,179,8,0.3)',
    accent:  '#eab308',
    icon:    SlowIcon,
    title:   'Slow connection detected',
    sub:     'Responses may take longer than usual.',
    pulse:   false,
  },
  reconnected: {
    bg:      '#080f0a',
    border:  'rgba(34,197,94,0.35)',
    accent:  '#22c55e',
    icon:    ReconnectedIcon,
    title:   'Back online',
    sub:     'Connection restored.',
    pulse:   false,
  },
};

function OfflineIcon({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

function PoorIcon({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill={color} stroke="none"/>
      <line x1="12" y1="3" x2="12" y2="3.01" stroke={color} strokeWidth="3"/>
    </svg>
  );
}

function SlowIcon({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ReconnectedIcon({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function SignalBars({ quality, color }) {
  const levels = { offline: 0, poor: 1, slow: 2, good: 3 };
  const filled = levels[quality] ?? 3;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: '3px',
          height: `${4 + i * 3}px`,
          borderRadius: '1px',
          background: i <= filled ? color : 'rgba(255,255,255,0.15)',
          transition: 'background 0.4s ease',
        }} />
      ))}
    </div>
  );
}

export default function NetworkBanner() {
  const { online, quality, latency, justReconnected } = useNetworkStatus();
  const [visible, setVisible]   = useState(false);
  const [variant, setVariant]   = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [animIn, setAnimIn]     = useState(false);

  useEffect(() => {
    if (justReconnected) {
      setVariant('reconnected');
      setDismissed(false);
      setVisible(true);
      setTimeout(() => setAnimIn(true), 10);
      const t = setTimeout(() => hide(), 4000);
      return () => clearTimeout(t);
    }

    if (!online || quality === 'offline') {
      setVariant('offline');
      setDismissed(false);
      setVisible(true);
      setTimeout(() => setAnimIn(true), 10);
      return;
    }

    if (quality === 'poor') {
      setVariant('poor');
      setDismissed(false);
      setVisible(true);
      setTimeout(() => setAnimIn(true), 10);
      return;
    }

    if (quality === 'slow') {
      setVariant('slow');
      setDismissed(false);
      setVisible(true);
      setTimeout(() => setAnimIn(true), 10);
      return;
    }

    if (online && quality === 'good' && !justReconnected) {
      hide();
    }
  }, [online, quality, justReconnected]);

  function hide() {
    setAnimIn(false);
    setTimeout(() => {
      setVisible(false);
      setVariant(null);
    }, 350);
  }

  function dismiss() {
    setDismissed(true);
    hide();
  }

  if (!visible || dismissed || !variant) return null;

  const cfg = CONFIG[variant];
  const Icon = cfg.icon;

  return (
    <>
      <style>{`
        @keyframes bannerSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes bannerSlideUp {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes networkPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.15); }
          50%       { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      <div
        role="alert"
        aria-live="assertive"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          animation: animIn
            ? 'bannerSlideDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            : 'bannerSlideUp 0.3s ease-in forwards',
        }}
      >
        <div style={{
          margin: '10px',
          padding: '10px 16px',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: `0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
          pointerEvents: 'all',
          minWidth: '280px',
          maxWidth: '480px',
          animation: cfg.pulse
            ? 'networkPulse 2s ease-in-out infinite'
            : 'none',
          backdropFilter: 'blur(12px)',
        }}>

          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: `${cfg.accent}18`,
            border: `1px solid ${cfg.accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon color={cfg.accent} size={16} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '2px',
            }}>
              {variant === 'offline' && (
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: cfg.accent,
                  animation: 'dotBlink 1.2s ease-in-out infinite',
                  flexShrink: 0,
                }} />
              )}
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: cfg.accent,
                letterSpacing: '0.1px',
              }}>
                {cfg.title}
              </span>
            </div>
            <span style={{
              fontSize: '11.5px',
              color: 'rgba(255,255,255,0.45)',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {cfg.sub}
              {latency && variant !== 'offline' && variant !== 'reconnected' && (
                <span style={{ marginLeft: 6, opacity: 0.6 }}>
                  ({latency}ms)
                </span>
              )}
            </span>
          </div>

          <SignalBars quality={quality} color={cfg.accent} />

          {variant !== 'offline' && (
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '12px',
                lineHeight: 1,
                transition: 'all 0.15s',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
}
