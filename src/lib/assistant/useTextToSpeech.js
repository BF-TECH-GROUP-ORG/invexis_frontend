// src/lib/assistant/useTextToSpeech.js
import { useState, useEffect, useRef, useCallback } from 'react';

function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')   
    .replace(/`([^`]+)`/g, '$1')                          
    .replace(/\*\*(.+?)\*\*/g, '$1')                      
    .replace(/\*(.+?)\*/g, '$1')                          
    .replace(/==(.+?)==/g, '$1')                          
    .replace(/^#{1,3}\s+/gm, '')                          
    .replace(/^[-*•]\s+/gm, '')                           
    .replace(/^\d+\.\s+/gm, '')                           
    .replace(/^>\s*!(warning|info|success|danger)\s+/gm, '') 
    .replace(/^>\s+/gm, '')                               
    .replace(/---+/g, '')                                 
    .replace(/\{\s*"action"[\s\S]*?\}/g, '')              
    .replace(/\s{2,}/g, ' ')                              
    .trim();
}

/**
 * Enhanced voice picker with multilingual support
 */
function pickVoice(voices, langCode = 'en') {
  if (!voices.length) return null;

  // Language mapping for normalization
  const targetLang = langCode.toLowerCase().split('-')[0]; // 'en', 'fr', 'sw', etc.

  // Priority natural voices per language
  const languagePriorities = {
    'en': ['Google UK English Female', 'Google US English', 'Microsoft Aria Online (Natural)', 'Samantha', 'Karen'],
    'fr': ['Google Français', 'Microsoft Denise Online (Natural)', 'Thomas', 'Audrey', 'Aurelie'],
    'sw': ['Google Kiswahili', 'Microsoft Zira'], // Swahili support varies by OS
    'rw': ['Google Kiswahili', 'Microsoft Zira'], // Fallback to Swahili for Kinyarwanda if no native RW voice
  };

  const preferredNames = languagePriorities[targetLang] || [];

  // 1. Try to find a high-quality preferred voice for this specific language
  for (const name of preferredNames) {
    const found = voices.find(v => v.name === name);
    if (found) return found;
  }

  // 2. Fallback: Find ANY voice matching the language code
  const langMatch = voices.filter(v => v.lang.startsWith(targetLang));
  if (langMatch.length) {
    // Prefer "Google" or "Natural" if available in the matches
    const bestLangMatch = langMatch.find(v => v.name.includes('Google') || v.name.includes('Natural')) || langMatch[0];
    return bestLangMatch;
  }

  // 3. Ultimate Fallback: High quality English voice
  return voices.find(v => v.name.includes('Google UK English Female')) || voices[0];
}

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const [activeId,    setActiveId]    = useState(null); 
  const utteranceRef  = useRef(null);
  const voicesRef     = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setIsSupported(true);
    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveId(null);
  }, []);

  const speak = useCallback((text, id, lang = 'en') => {
    if (!isSupported) return;
    if (isSpeaking && activeId === id) {
      stop();
      return;
    }
    
    window.speechSynthesis.cancel();
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;

    // Set target language
    const voice = pickVoice(voicesRef.current, lang);
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    } else {
        utterance.lang = lang;
    }

    utterance.rate   = 0.95;  
    utterance.pitch  = 1.0;  
    utterance.volume = 1.0;

    utterance.onstart  = () => { setIsSpeaking(true);  setIsPaused(false); setActiveId(id); };
    utterance.onend    = () => { setIsSpeaking(false); setIsPaused(false); setActiveId(null); };
    utterance.onerror  = (e) => { 
        console.error("TTS Error:", e);
        setIsSpeaking(false); 
        setIsPaused(false); 
        setActiveId(null); 
    };
    utterance.onpause  = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking, activeId, stop]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isPaused]);

  return { isSupported, isSpeaking, isPaused, activeId, speak, pause, resume, stop };
}
