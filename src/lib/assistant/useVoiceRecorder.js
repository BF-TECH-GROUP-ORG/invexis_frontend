// src/lib/assistant/useVoiceRecorder.js
import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording]   = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const isPausedRef                     = useRef(false);
  const [audioBlob, setAudioBlob]       = useState(null);
  const [audioUrl, setAudioUrl]         = useState(null);
  const [duration, setDuration]         = useState(0);
  const [waveformData, setWaveformData] = useState(new Array(30).fill(4));

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const animFrameRef     = useRef(null);
  const audioCtxRef      = useRef(null);
  const timerRef         = useRef(null);
  const durationRef      = useRef(0);
  const streamRef        = useRef(null);

  const stopAll = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
  }, []);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  const startRecording = useCallback(async () => {
    try {
      // Cleanup previous
      stopAll();
      
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      durationRef.current = 0;
      chunksRef.current = [];
      setIsPaused(false);
      isPausedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      // Support multiple mime types for cross-browser compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url  = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      recorder.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          durationRef.current += 1;
          setDuration(durationRef.current);
        }
      }, 1000);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        if (!isPausedRef.current) {
          analyser.getByteFrequencyData(dataArray);
          const bars = Array.from({ length: 30 }, (_, i) => {
            const idx = Math.floor((i / 30) * dataArray.length);
            const val = dataArray[idx] / 255;
            return Math.max(4, val * 32); 
          });
          setWaveformData(bars);
        }
        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();

    } catch (err) {
      console.error('Microphone access denied or recorder error:', err);
      throw err;
    }
  }, [stopAll]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      isPausedRef.current = true;
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      isPausedRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAll();
    setIsRecording(false);
    setIsPaused(false);
    isPausedRef.current = false;
  }, [stopAll]);

  const clearRecording = useCallback(() => {
    stopAll();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setWaveformData(new Array(30).fill(4));
  }, [stopAll]);

  function formatDuration(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    duration,
    durationFormatted: formatDuration(duration),
    waveformData,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
  };
}
