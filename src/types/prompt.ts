export interface Prompt {
  text: string;
  duration: number;
  category: string;
}

export interface Flashcard {
  french: string;
  english: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  percentageFrench: number;
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
}