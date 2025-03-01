/**
 * Type definitions for flashcard generation test utilities
 */

export interface TestCase {
  id: string;
  language: 'french' | 'spanish';
  description: string;
  text: string;
  expectedIssues?: string[];
}

export interface Flashcard {
  targetLanguage: string;
  english: string;
  type: 'correction' | 'translation' | 'variation';
  originalText?: string;
  isSelected?: boolean;
}

export interface TestResult {
  success: boolean;
  testCase: TestCase;
  result?: {
    flashcards: Flashcard[];
  };
  error?: any;
}

export interface TestResults {
  timestamp: string;
  results: TestResult[];
}
