import { useState, useCallback } from 'react';
import { sendMessage } from './aiClient';
import useAuth from '../../hooks/useAuth';

export function useAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const sendUserMessage = useCallback(async (text, extraContext = {}) => {
    const timestamp = new Date();
    const newMessages = [...messages, { role: 'user', content: text, timestamp }];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const context = { 
        isAuthenticated, 
        userRole: user?.role,
        ...extraContext 
      };
      const reply = await sendMessage(newMessages, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
      return reply;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messages, isAuthenticated, user]);

  const clearMessages = () => setMessages([]);

  return { messages, loading, error, sendUserMessage, clearMessages };
}
