import { useState, useCallback } from 'react';
import { sendMessage } from './aiClient';
import useAuth from '../../hooks/useAuth';

export function useAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const sendUserMessage = useCallback(async (text, extraContext = {}, image = null) => {
    if (!text && !image) return;

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
      
      // We need the current messages + the new one for the API
      // Since setMessages is async, we use the functional update or just build it here
      const historyForApi = [...messages, userMessage];
      
      const reply = await sendMessage(historyForApi, context, image);
      
      if (!reply) throw new Error("No response from assistant");

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
      return reply;
    } catch (err) {
      console.error("Assistant Error:", err);
      setError(err.message || "Failed to get a response. Please check your connection.");
      // Optional: remove the user message if it failed? 
      // Usually better to keep it and let user retry.
    } finally {
      setLoading(false);
    }
  }, [messages, isAuthenticated, user]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendUserMessage, clearMessages };
}
