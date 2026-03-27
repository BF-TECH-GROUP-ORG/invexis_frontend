import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus } from 'lucide-react';

export default function SuggestionChips({ suggestions, onSelect, visible }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-wrap gap-2 mt-4 px-2"
        >
          {suggestions.map((text, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 120, 45, 0.15)' }}
              whileActive={{ scale: 0.95 }}
              onClick={() => onSelect(text)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl text-[13px] font-bold text-orange-700 shadow-sm transition-colors hover:border-orange-200"
            >
              <MessageSquarePlus size={14} className="text-orange-400" />
              {text}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
