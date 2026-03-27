// src/lib/assistant/modelRouter.js

export const GROQ_MODELS = {
  // Text generation
  text_default:      'llama-3.3-70b-versatile',
  text_multilingual: 'moonshotai/kimi-k2-instruct-0905', 

  // Speech to text
  whisper_fast:      'whisper-large-v3-turbo',
  whisper_accurate:  'whisper-large-v3',

  // Vision
  vision:            'meta-llama/llama-4-scout-17b-16e-instruct',
};

// Supported languages for specialized model
const MULTILINGUAL_LANGS = ['rw', 'fr', 'sw', 'kinyarwanda', 'french', 'swahili'];

/**
 * Basic language detector from text
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  const lower = text.toLowerCase();

  // Kinyarwanda keywords
  const rw = ['muri', 'ndi', 'ndashaka', 'bite', 'muraho', 'ese', 'kuki', 'neza', 'oya', 'yego', 'amakuru'];
  // French keywords
  const fr = ['bonjour', 'comment', 'je', 'tu', 'est', 'une', 'les', 'des', 'pour', 'avec', 'salut'];
  // Swahili keywords
  const sw = ['habari', 'nini', 'nina', 'nataka', 'sijui', 'karibu', 'asante', 'sawa', 'kwa', 'jambo'];

  if (rw.some(w => lower.includes(w))) return 'rw';
  if (fr.some(w => lower.includes(w))) return 'fr';
  if (sw.some(w => lower.includes(w))) return 'sw';
  return 'en';
}

/**
 * Decide which text model to use based on detected language
 */
export function resolveTextModel(text) {
  const lang = detectLanguage(text);
  return MULTILINGUAL_LANGS.includes(lang)
    ? GROQ_MODELS.text_multilingual
    : GROQ_MODELS.text_default;
}
