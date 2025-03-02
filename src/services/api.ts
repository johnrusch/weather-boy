/**
 * API Service for the language learning application
 * Centralizes all API calls to maintain consistency and improve maintainability
 */

import type { Prompt, Transcription } from '../types/prompt';
import type { FlashcardType } from '../types/flashcard';

// API Response Types
interface TranscriptionResponse {
  text: string;
}

interface EvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

interface FlashcardsResponse {
  flashcards: FlashcardType[];
}

interface ProgressResponse {
  campaignProgress: {
    currentLevel: number;
    completedLevels: number[];
    bestScores: Record<number, number>;
    flashcardRequirements?: Record<number, {
      lastFailedAttempt: string;
      requiredFlashcards: FlashcardType[];
    }>;
  };
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Handles API response error checking
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new ApiError(errorData.error || 'API request failed', response.status);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(`API request failed with status ${response.status}`, response.status);
    }
  }
  
  return response.json() as Promise<T>;
}

/**
 * Transcribe audio to text
 */
export async function transcribeAudio(audioBlob: Blob, language: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("language", language);
    
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    
    const data = await handleResponse<TranscriptionResponse>(response);
    return data.text;
  } catch (error) {
    console.error("Transcription error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to transcribe audio", 500);
  }
}

/**
 * Evaluate user's spoken response
 */
export async function evaluateResponse(
  transcription: string, 
  promptText: string, 
  language: string,
  mode: string = 'free',
  levelId?: number
): Promise<EvaluationResponse> {
  try {
    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcription,
        prompt: promptText,
        language,
        mode,
        levelId
      }),
    });
    
    return await handleResponse<EvaluationResponse>(response);
  } catch (error) {
    console.error("Evaluation error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to evaluate response", 500);
  }
}

/**
 * Generate flashcards from transcription
 */
export async function generateFlashcards(
  transcription: string, 
  language: string
): Promise<FlashcardType[]> {
  try {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: transcription, 
        language 
      }),
    });
    
    const data = await handleResponse<FlashcardsResponse>(response);
    return data.flashcards;
  } catch (error) {
    console.error("Flashcard generation error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to generate flashcards", 500);
  }
}

/**
 * Fetch user campaign progress
 */
export async function fetchProgress(): Promise<ProgressResponse> {
  try {
    const response = await fetch('/api/progress');
    
    // Special case for new users with no progress
    if (response.status === 404) {
      // Create initial progress
      const createResponse = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      return await handleResponse<ProgressResponse>(createResponse);
    }
    
    return await handleResponse<ProgressResponse>(response);
  } catch (error) {
    console.error("Progress fetch error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch progress", 500);
  }
}

/**
 * Update user campaign progress
 */
export async function updateProgress(
  levelId: number, 
  score: number
): Promise<ProgressResponse> {
  try {
    const response = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, score }),
    });
    
    return await handleResponse<ProgressResponse>(response);
  } catch (error) {
    console.error("Progress update error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to update progress", 500);
  }
}
