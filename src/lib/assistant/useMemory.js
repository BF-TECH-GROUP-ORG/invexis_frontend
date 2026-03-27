// src/lib/assistant/useMemory.js
import { useState, useEffect, useCallback } from 'react';

export function useMemory(userId) {
  const [memories, setMemories] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  // Fetch memories on mount (or when user changes)
  useEffect(() => {
    if (!userId) {
      setLoaded(true);
      return;
    }
    
    fetch(`/api/assistant/memory?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setMemories(data || []);
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to fetch memories:", err);
        setLoaded(true);
      });
  }, [userId]);

  // Format memories as a readable string for the system prompt
  const memoriesAsText = useCallback(() => {
    if (!memories || memories.length === 0) return null;
    return memories
      .map(m => `- ${m.memory_key.replace(/_/g, ' ')}: ${m.memory_value}`)
      .join('\n');
  }, [memories]);

  // Manually add a memory (for explicit user requests outside of tool calls)
  const addMemory = useCallback(async (key, value) => {
    if (!userId) return;
    try {
      await fetch('/api/assistant/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, memory_key: key, memory_value: value }),
      });
      setMemories(prev => {
        const filtered = prev.filter(m => m.memory_key !== key);
        return [...filtered, { memory_key: key, memory_value: value }];
      });
    } catch (e) {
      console.error("Failed to save memory:", e);
    }
  }, [userId]);

  // Delete a memory
  const forgetMemory = useCallback(async (key) => {
    if (!userId) return;
    try {
      await fetch(`/api/assistant/memory/${userId}/${key}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.memory_key !== key));
    } catch (e) {
      console.error("Failed to delete memory:", e);
    }
  }, [userId]);

  // Clear all memories
  const clearAllMemories = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch(`/api/assistant/memory?userId=${userId}`, { method: 'DELETE' });
      setMemories([]);
    } catch (e) {
      console.error("Failed to clear memories:", e);
    }
  }, [userId]);

  return { memories, loaded, memoriesAsText, addMemory, forgetMemory, clearAllMemories };
}
