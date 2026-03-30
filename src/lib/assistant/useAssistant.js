import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessage, executeTool } from './aiClient';
import useAuth from '../../hooks/useAuth';
import { useNetworkStatus } from '../network/useNetworkStatus';
import { v4 as uuidv4 } from 'uuid';
import { useMemory } from './useMemory';
import { buildSystemPrompt, INVEXIX_APP_INFO } from './systemPrompt';

export function useAssistant() {
  const { user, isAuthenticated } = useAuth();
  const { online, quality } = useNetworkStatus();
  const { memories, memoriesAsText, addMemory, forgetMemory } = useMemory(user?.id);

  const [sessionId, setSessionId] = useState(() => uuidv4?.() || `session_${Date.now()}`);
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const logAnalytics = useCallback(async (data) => {
    try {
      await fetch('/api/assistant/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sessionId,
          userId: user?.id,
          userRole: user?.role,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Analytics log failed:", e);
    }
  }, [sessionId, user]);

  const saveTimerRef = useRef(null);

  const saveHistory = useCallback(async (currentMessages) => {
    if (currentMessages.length === 0) return;
    
    // Clear existing timer for debounce
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const firstUserMsg = currentMessages.find(m => m.role === 'user')?.content || "";
        const summary = firstUserMsg.slice(0, 80) + (firstUserMsg.length > 80 ? "..." : "");

        await fetch('/api/assistant/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId: user?.id || 'anonymous',
            messages: currentMessages,
            summary
          }),
        });
      } catch (e) {
        console.error("History save failed:", e);
      }
    }, 3000); // 3-second debounce as per documentation
  }, [sessionId, user]);

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

    const startTime = Date.now();
    const timestamp = new Date();
    const userMessage = { role: 'user', content: text, timestamp };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const enrichedPrompt = buildSystemPrompt(INVEXIX_APP_INFO, {
        isAuthenticated,
        userName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'User',
        userRole: user?.role,
        userShop: user?.shop?.name || user?.shop,
        userCompany: user?.company?.name || user?.company,
        memories: memoriesAsText(),
        ...extraContext
      });

      // Passing the enriched prompt as part of the context object as the backend likely expects.
      // If it fails, we should check if the API needs 'systemPrompt' at the top level.
      const result = await sendMessage(newMessages, { 
        ...extraContext,
        isAuthenticated,
        systemPrompt: enrichedPrompt // Standard field for system instructions
      }, image);
      
      if (!result?.text) throw new Error("Inara is resting. Please try again in a moment.");

      const { text, usage, toolCall } = result;

      // Tool call detection (Now using structured data from API)
      if (toolCall) {
        const { name, args } = toolCall;
        try {
          // Sync client-side state for memories immediately
          if (name === 'save_memory') {
            await addMemory(args.memory_key, args.memory_value);
          } else if (name === 'forget_memory') {
            await forgetMemory(args.memory_key);
          } else {
            // Other tools (email, escalate)
            await executeTool(name, args, user?.id);
          }
        } catch (e) {
          console.error("Tool sync failed:", e);
        }
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: text, 
        timestamp: new Date(),
        usage: usage // Store usage info in the message object
      };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Log Analytics
      logAnalytics({
        userMessage: text,
        inaraReply: assistantMessage.content,
        responseTime: Date.now() - startTime
      });

      // Save History (auto-save)
      saveHistory(finalMessages);

      return text;

    } catch (err) {
      const isNetworkError =
        err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('timeout') ||
        !online;

      setError({
        type: isNetworkError ? (quality === 'offline' ? 'offline' : 'slow') : 'api',
        message: err.message || "Failed to get a response. Please check your connection.",
        technicalDetails: err.technicalDetails || err.stack,
        retryFn: () => sendUserMessage(text, extraContext, image),
      });
    } finally {
      setLoading(false);
    }
  }, [messages, isAuthenticated, user, online, quality, memoriesAsText, sessionId, logAnalytics, saveHistory]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(uuidv4?.() || `session_${Date.now()}`);
    setError(null);
  }, []);

  const loadSession = useCallback((historySession) => {
    setSessionId(historySession.sessionId);
    setMessages(historySession.messages);
  }, []);

  return { 
    messages, 
    setMessages,
    loading, 
    error, 
    online,
    quality,
    sendUserMessage, 
    clearMessages,
    dismissError: () => setError(null),
    loadSession,
    memories,
    sessionId
  };
}
