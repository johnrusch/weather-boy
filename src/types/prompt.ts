export interface Prompt {
  text: string;
  duration: number;
  category: string;
}

export interface Flashcard {
  targetLanguage: string;
  english: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  percentageTargetLanguage: number;
}

export interface Transcription {
  text: string;
  prompt: Prompt;
  timestamp: string;
  flashcards: Flashcard[];
  evaluation?: Evaluation;
}

export interface SessionSettings {
  promptCount: number;
  promptDuration: number;
  language: 'french' | 'spanish';
}

export type SupportedLanguage = 'french' | 'spanish';

export interface LanguageConfig {
  name: string;
  code: string;
  displayName: string;
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  french: {
    name: 'French',
    code: 'fr',
    displayName: 'Français'
  },
  spanish: {
    name: 'Spanish',
    code: 'es',
    displayName: 'Español'
  }
};