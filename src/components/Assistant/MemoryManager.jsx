// src/components/Assistant/MemoryManager.jsx
import { useState } from 'react';
import { useMemory } from '../../lib/assistant/useMemory';
import { X, Trash2, Brain, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryManager({ userId, onClose }) {
  const { memories, forgetMemory, clearAllMemories, loaded } = useMemory(userId);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!loaded) return (
    <div className="flex items-center justify-center p-10">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff782d]"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#ff782d]" />
          <h3 className="font-bold text-[15px] text-slate-900">Personalization Memory</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Inara remembers these facts about you to provide a more personalized experience. You can remove any item at any time.
        </p>

        {!memories || memories.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain size={24} className="text-slate-200" />
            </div>
            <p className="text-[12px] text-slate-400 font-medium">No memories saved yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((m) => (
              <div key={m.memory_key} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 group">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{m.memory_key.replace(/_/g, ' ')}</span>
                  <p className="text-[13px] text-slate-700 font-medium">{m.memory_value}</p>
                </div>
                <button 
                  onClick={() => forgetMemory(m.memory_key)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {memories && memories.length > 0 && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          {confirmClear ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-[12px] font-bold uppercase tracking-tight">Are you absolutely sure?</span>
              </div>
              <p className="text-[12px] text-slate-600">This will erase everything Inara has learned about you. This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => { clearAllMemories(); setConfirmClear(false); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[12px] font-bold hover:bg-red-700 transition-colors">Yes, clear all</button>
                <button onClick={() => setConfirmClear(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="w-full py-2.5 text-red-600 text-[12px] font-bold hover:bg-red-50 rounded-lg transition-colors border border-dashed border-red-200">
              Clear all memories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
