/**
 * Language Session Hook
 * Custom hook for managing language learning session state
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Prompt, Transcription, SessionSettings } from '../types/prompt';
import { useLanguage } from '../contexts/LanguageContext';
import { loadRandomPrompts } from '../services/promptService';
import { createRecordingSession, startRecording, stopRecording, type AudioRecording, type RecordingSession } from '../services/recordingService';
import { transcribeAudio, evaluateResponse, generateFlashcards } from '../services/api';

// Default session settings
export const DEFAULT_SETTINGS: SessionSettings = {
  promptCount: 4,
  promptDuration: 5,
};

// Session processing stages
export type ProcessingStage = 'idle' | 'transcribing' | 'evaluating' | 'generating';

export interface LanguageSessionState {
  // Settings
  settings: SessionSettings;
  setSettings: (settings: SessionSettings) => void;
  
  // Prompts
  selectedPrompts: Prompt[];
  currentPromptIndex: number;
  
  // Timer
  timeLeft: number;
  
  // Recording
  isRecording: boolean;
  
  // Processing
  isProcessing: boolean;
  processingStage: ProcessingStage;
  
  // Results
  transcriptions: Transcription[];
  audioRecordings: AudioRecording[];
  error: string | null;
  
  // Session actions
  startPromptSession: () => Promise<void>;
  handleNextPrompt: () => Promise<void>;
  resetSession: () => void;
}

export function useLanguageSession(): LanguageSessionState {
  // Get language from context
  const { language } = useLanguage();
  
  // Settings state
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  
  // Prompt state
  const [selectedPrompts, setSelectedPrompts] = useState<Prompt[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(-1);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number>();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  
  // Results state
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const expectedRecordingsRef = useRef<number>(0);
  
  // Reset session
  const resetSession = useCallback(() => {
    // Clear prompts and recordings
    setSelectedPrompts([]);
    setCurrentPromptIndex(-1);
    setTimeLeft(0);
    setIsRecording(false);
    setRecordingSession(null);
    setAudioRecordings([]);
    
    // Clear results
    setTranscriptions([]);
    setError(null);
    
    // Reset processing
    setIsProcessing(false);
    setProcessingStage('idle');
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);
  
  // Start a recording session
  const startSessionRecording = useCallback(async () => {
    try {
      const session = createRecordingSession();
      const updatedSession = await startRecording(session, setIsRecording);
      setRecordingSession(updatedSession);
    } catch (err) {
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
    }
  }, []);
  
  // Stop the current recording
  const stopSessionRecording = useCallback(async () => {
    if (recordingSession && isRecording) {
      try {
        const recording = await stopRecording(
          recordingSession,
          currentPromptIndex,
          setIsRecording
        );
        setAudioRecordings(prev => [...prev, recording]);
        setRecordingSession(null);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  }, [recordingSession, isRecording, currentPromptIndex]);
  
  // Process all recordings from the session
  const processAllRecordings = useCallback(async () => {
    if (audioRecordings.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    setProcessingStage('transcribing');
    
    const newTranscriptions: Transcription[] = [];
    
    console.log(`Processing ${audioRecordings.length} recordings with language: ${language}`);
    
    // Process each recording
    for (const recording of audioRecordings) {
      try {
        // Step 1: Transcribe audio
        const transcriptionText = await transcribeAudio(recording.blob, language);
        
        // Step 2: Get evaluation
        setProcessingStage('evaluating');
        const currentPrompt = selectedPrompts[recording.promptIndex];
        const evaluation = await evaluateResponse(
          transcriptionText,
          currentPrompt.text,
          language,
          'free'
        );
        
        // Step 3: Generate flashcards
        setProcessingStage('generating');
        const flashcards = await generateFlashcards(transcriptionText, language);
        
        // Create the transcription object
        newTranscriptions.push({
          text: transcriptionText,
          prompt: currentPrompt,
          timestamp: new Date().toISOString(),
          flashcards,
          evaluation
        });
        
      } catch (error) {
        console.error('Error processing recording:', error);
        setError('Failed to process recording');
      }
    }
    
    // Update state with all transcriptions
    setTranscriptions(prev => [...prev, ...newTranscriptions]);
    setIsProcessing(false);
    setProcessingStage('idle');
    setAudioRecordings([]);
  }, [audioRecordings, language, selectedPrompts]);
  
  // Start a new prompt session
  const startPromptSession = useCallback(async () => {
    resetSession();
    
    try {
      console.log(`Starting free practice session with language: ${language}`);
      
      // Load prompts for the session
      const prompts = await loadRandomPrompts(language, settings);
      
      expectedRecordingsRef.current = prompts.length;
      setSelectedPrompts(prompts);
      setCurrentPromptIndex(0);
      setTimeLeft(prompts[0].duration);
      
      // Start recording
      await startSessionRecording();
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start session. Please try again.');
    }
  }, [language, settings, resetSession, startSessionRecording]);
  
  // Move to the next prompt
  const handleNextPrompt = useCallback(async () => {
    console.log(`Handling next prompt. Current index: ${currentPromptIndex}, Total prompts: ${selectedPrompts.length}`);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop current recording
    await stopSessionRecording();
    
    if (currentPromptIndex < selectedPrompts.length - 1) {
      // Move to next prompt
      const nextIndex = currentPromptIndex + 1;
      console.log(`Moving to next prompt ${nextIndex + 1}`);
      setCurrentPromptIndex(nextIndex);
      setTimeLeft(selectedPrompts[nextIndex].duration);
      
      // Start new recording
      await startSessionRecording();
    } else {
      // This is the last prompt
      console.log('Finished last prompt, preparing to process recordings');
      setCurrentPromptIndex(-1);
      setTimeLeft(0);
      
      // Wait a moment for the last recording to be added
      setTimeout(() => {
        if (audioRecordings.length === expectedRecordingsRef.current) {
          console.log('Processing all recordings');
          processAllRecordings();
        } else {
          console.warn(`Missing recordings. Expected: ${expectedRecordingsRef.current}, Got: ${audioRecordings.length}`);
          setError('Some recordings were not properly saved. Please try again.');
        }
      }, 500);
    }
  }, [
    currentPromptIndex,
    selectedPrompts,
    stopSessionRecording,
    startSessionRecording,
    audioRecordings.length,
    processAllRecordings
  ]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && currentPromptIndex >= 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            
            if (currentPromptIndex < selectedPrompts.length - 1) {
              // Automatically move to next prompt when time runs out
              stopSessionRecording().then(() => {
                const nextIndex = currentPromptIndex + 1;
                setCurrentPromptIndex(nextIndex);
                setTimeLeft(selectedPrompts[nextIndex].duration);
                startSessionRecording();
              });
              return 0;
            } else {
              // End of session when time runs out on last prompt
              stopSessionRecording();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [
    timeLeft,
    currentPromptIndex,
    selectedPrompts,
    stopSessionRecording,
    startSessionRecording
  ]);
  
  return {
    // Settings
    settings,
    setSettings,
    
    // Prompts
    selectedPrompts,
    currentPromptIndex,
    
    // Timer
    timeLeft,
    
    // Recording
    isRecording,
    
    // Processing
    isProcessing,
    processingStage,
    
    // Results
    transcriptions,
    audioRecordings,
    error,
    
    // Session actions
    startPromptSession,
    handleNextPrompt,
    resetSession
  };
}
