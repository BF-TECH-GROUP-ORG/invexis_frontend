// src/components/Assistant/AssistantNetworkError.jsx
"use client";

export default function AssistantNetworkError({ quality, onRetry }) {
  const isOffline = quality === 'offline';

  const styles = isOffline
    ? { accent: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' }
    : { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: '12px',
      padding: '14px 16px',
      margin: '4px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `${styles.accent}15`,
          border: `1px solid ${styles.accent}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isOffline ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={styles.accent} strokeWidth="2.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <circle cx="12" cy="20" r="1" fill={styles.accent} stroke="none"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={styles.accent} strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          )}
        </div>

        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: styles.accent,
            marginBottom: '2px',
          }}>
            {isOffline ? "Couldn't reach Inara" : 'Inara took too long to respond'}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: '1.4',
          }}>
            {isOffline
              ? 'You appear to be offline. Check your internet and try again.'
              : 'Your connection is slow. Inara is still available — try again.'}
          </div>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            alignSelf: 'flex-start',
            padding: '7px 16px',
            borderRadius: '8px',
            background: `${styles.accent}18`,
            border: `1px solid ${styles.accent}40`,
            color: styles.accent,
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}
