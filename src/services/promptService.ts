/**
 * Prompt Service
 * Centralizes prompt management functionality for the language learning application
 */

import type { Prompt, SessionSettings } from '../types/prompt';
import { getRandomPromptsByLanguage } from '../data/prompts';
import type { SupportedLanguage } from './languageService';

/**
 * Load random prompts based on language and session settings
 */
export async function loadRandomPrompts(
  language: SupportedLanguage,
  settings: SessionSettings
): Promise<Prompt[]> {
  try {
    // Get random prompts for the specified language
    const prompts = await getRandomPromptsByLanguage(language, settings.promptCount);
    
    // Override duration with user settings (convert minutes to seconds)
    return prompts.map(prompt => ({
      ...prompt,
      language,
      duration: settings.promptDuration * 60 // Convert minutes to seconds
    }));
  } catch (error) {
    console.error('Error loading random prompts:', error);
    throw new Error('Failed to load prompts. Please try again.');
  }
}

/**
 * Format campaign level prompts with proper language and duration
 */
export function formatCampaignPrompts(
  prompts: Prompt[],
  language: SupportedLanguage,
  durationMinutes: number
): Prompt[] {
  // Apply the selected language and adjust durations
  return prompts.map(prompt => ({
    ...prompt,
    language, // Use active language
    duration: durationMinutes * 60 // Convert minutes to seconds
  }));
}

/**
 * Calculate progress percentage for a timer
 */
export function calculateTimerProgress(
  timeLeft: number,
  totalDuration: number
): number {
  if (totalDuration <= 0) return 0;
  return (timeLeft / totalDuration) * 100;
}

/**
 * Validate prompt data to ensure it's complete and correctly formatted
 */
export function validatePrompt(prompt: Prompt): boolean {
  if (!prompt.text || prompt.text.trim() === '') {
    console.error('Invalid prompt: missing text');
    return false;
  }
  
  if (!prompt.language) {
    console.error('Invalid prompt: missing language');
    return false;
  }
  
  if (typeof prompt.duration !== 'number' || prompt.duration <= 0) {
    console.error('Invalid prompt: invalid duration', prompt.duration);
    return false;
  }
  
  return true;
}
