export interface Prompt {
  text: string;
  duration: number;
  category: string;
  language?: 'french' | 'spanish';
}

export interface Flashcard {
  targetLanguage: string;
  english: string;
  type: 'correction' | 'translation' | 'variation';
  originalText?: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  percentageTargetLanguage: number;
  promptRelevance: string;
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