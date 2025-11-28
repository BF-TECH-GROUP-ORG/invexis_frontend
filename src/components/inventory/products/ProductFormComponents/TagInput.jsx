"use client";

import { Plus, X, Tag } from "lucide-react";

export default function TagInput({ tags, tagInput, setTagInput, onAddTag, onRemoveTag }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Product Tags (Max 10)
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddTag();
            }
          }}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="Type and press Enter..."
          disabled={tags.length >= 10}
        />
        <button
          type="button"
          onClick={onAddTag}
          disabled={!tagInput.trim() || tags.length >= 10}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-2"
          >
            <Tag size={14} />
            {tag}
            <button 
              type="button"
              onClick={() => onRemoveTag(index)}
              className="hover:text-orange-900"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">{tags.length}/10 tags used</p>
    </div>
  );
}