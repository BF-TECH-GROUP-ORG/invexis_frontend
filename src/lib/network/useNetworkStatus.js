// src/lib/network/useNetworkStatus.js
import { useState, useEffect, useRef, useCallback } from 'react';

const PING_URL = '/images/Invexix%20Logo-Light%20Mode.png'; 
const PING_INTERVAL_GOOD    = 30000; 
const PING_INTERVAL_POOR    = 8000;  
const PING_TIMEOUT          = 5000;  
const SLOW_THRESHOLD_MS     = 1500;  
const POOR_THRESHOLD_MS     = 3000;  

export function useNetworkStatus() {
  const [status, setStatus] = useState({
    online:  typeof navigator !== 'undefined' ? navigator.onLine : true,
    quality: 'good',
    latency: null,         
    justReconnected: false,
  });

  const pingTimerRef    = useRef(null);
  const justOnlineRef   = useRef(false);
  const failCountRef    = useRef(0);

  const ping = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const start = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT);

    try {
      await fetch(`${PING_URL}?_=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latency = Math.round(performance.now() - start);
      failCountRef.current = 0;

      let quality = 'good';
      if (latency > POOR_THRESHOLD_MS)  quality = 'poor';
      else if (latency > SLOW_THRESHOLD_MS) quality = 'slow';

      setStatus(prev => ({
        online:  true,
        quality,
        latency,
        justReconnected: justOnlineRef.current,
      }));

      if (justOnlineRef.current) {
        setTimeout(() => {
          justOnlineRef.current = false;
          setStatus(prev => ({ ...prev, justReconnected: false }));
        }, 3500);
      }

      const interval = quality === 'good' ? PING_INTERVAL_GOOD : PING_INTERVAL_POOR;
      pingTimerRef.current = setTimeout(ping, interval);

    } catch {
      clearTimeout(timeout);
      failCountRef.current += 1;

      const quality = failCountRef.current >= 3 ? 'offline' : 'poor';
      setStatus(prev => ({
        online:  quality !== 'offline',
        quality,
        latency: null,
        justReconnected: false,
      }));

      pingTimerRef.current = setTimeout(ping, PING_INTERVAL_POOR);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleOnline() {
      justOnlineRef.current = true;
      failCountRef.current  = 0;
      clearTimeout(pingTimerRef.current);
      ping();
    }

    function handleOffline() {
      failCountRef.current = 99;
      clearTimeout(pingTimerRef.current);
      setStatus({ online: false, quality: 'offline', latency: null, justReconnected: false });
    }

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    ping();

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(pingTimerRef.current);
    };
  }, [ping]);

  return status;
}
