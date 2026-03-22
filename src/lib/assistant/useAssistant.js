// src/lib/assistant/useAssistant.js
import { useState, useCallback, useRef } from 'react';
import { sendMessage } from './aiClient';
import useAuth from '../../hooks/useAuth';
import { useNetworkStatus } from '../network/useNetworkStatus';

export function useAssistant() {
  const { user, isAuthenticated } = useAuth();
  const { online, quality } = useNetworkStatus();

  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null); // null | { type, message, retryFn, technicalDetails }
  
  const lastInputRef = useRef(null); 

  const sendUserMessage = useCallback(async (text, extraContext = {}, image = null) => {
    if (!text && !image) return;

    if (!online) {
      setError({
        type: 'offline',
        message: 'No internet connection.',
        retryFn: () => sendUserMessage(text, extraContext, image),
      });
      return;
    }

    const timestamp = new Date();
    const userMessage = { role: 'user', content: text, timestamp };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const context = { 
        isAuthenticated, 
        userRole: user?.role,
        ...extraContext 
      };
      
      const historyForApi = [...messages, userMessage];
      
      const reply = await sendMessage(historyForApi, context, image);
      
      if (!reply) throw new Error("Inara is resting. Please try again in a moment.");

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
      return reply;

    } catch (err) {
      /* 
         FUTURE: Log this to Admin Dashboard: 
         { 
           user: user?.id, 
           error: err.message, 
           technical: err.technicalDetails,
           stack: err.stack 
         }
      */
      
      const isNetworkError =
        err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('timeout') ||
        !online;

      setError({
        type: isNetworkError ? (quality === 'offline' ? 'offline' : 'slow') : 'api',
        message: err.message || "Failed to get a response. Please check your connection.",
        technicalDetails: err.technicalDetails || err.stack, // Preserved
        retryFn: () => sendUserMessage(text, extraContext, image),
      });
    } finally {
      setLoading(false);
    }
  }, [messages, isAuthenticated, user, online, quality]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return { 
    messages, 
    setMessages,
    loading, 
    error, 
    online,
    quality,
    sendUserMessage, 
    clearMessages,
    dismissError
  };
}
