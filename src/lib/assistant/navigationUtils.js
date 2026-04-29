/**
 * Utilities for extracting and parsing navigation/action commands from AI responses.
 */
import { resolveTourKey, TOUR_MAP } from './tourService';

export const ACTION_REGEX_CODE_FENCE = /```(?:json)?[\s\S]*?(\{[\s\S]*?"action"\s*:\s*".+?"[\s\S]*?\})[\s\S]*?```/g;
export const ACTION_REGEX_BARE = /\{[^{}]*?"action"\s*:\s*".+?"[^{}]*?\}/g;

/**
 * Extracts structured actions from a text response.
 * @param {string} text - Raw AI response text.
 * @returns {Object} { cleanText, actions }
 */
export function extractActions(text) {
    if (!text) return { cleanText: text, actions: [] };
    
    let cleanText = text;
    const actions = [];
    
    // 1. Try code-fenced JSON
    let match;
    const matches = [...text.matchAll(ACTION_REGEX_CODE_FENCE)];
    for (const m of matches) {
        try {
            const parsed = JSON.parse(m[1].trim());
            actions.push(parsed);
            cleanText = cleanText.replace(m[0], '');
        } catch (e) {
            console.warn('[NavigationUtils] Failed to parse code-fenced action JSON:', e);
        }
    }
    
    // 2. Try bare JSON (if not already matched)
    const bareMatches = [...cleanText.matchAll(ACTION_REGEX_BARE)];
    for (const m of bareMatches) {
        try {
            const parsed = JSON.parse(m[0]);
            // Avoid duplicates
            if (!actions.some(a => JSON.stringify(a) === JSON.stringify(parsed))) {
                actions.push(parsed);
                cleanText = cleanText.replace(m[0], '');
            }
        } catch (e) {
            // Bare JSON matching is more risky, so we fail silently
        }
    }
    
    return { cleanText: cleanText.trim(), actions };
}

/**
 * Detects navigation intent from a user prompt and AI response.
 * @param {string} userPrompt - Original user message.
 * @param {Object} navFromAI - Navigation object extracted from AI response (if any).
 * @returns {Object|null} Combined navigation data.
 */
export function getNavigationTarget(userPrompt, navFromAI = null) {
    // Priority 1: Explicit AI instruction
    if (navFromAI && navFromAI.path) {
        return {
            path: navFromAI.path,
            label: navFromAI.label || (TOUR_MAP[navFromAI.path]?.title) || "Target Page",
            auto: navFromAI.auto || false,
            type: 'explicit'
        };
    }

    // Priority 2: Intent-based detection from prompt
    const tourKey = resolveTourKey(userPrompt);
    if (tourKey && TOUR_MAP[tourKey]) {
        return {
            path: tourKey,
            label: TOUR_MAP[tourKey].title,
            auto: false,
            type: 'intent'
        };
    }

    return null;
}
