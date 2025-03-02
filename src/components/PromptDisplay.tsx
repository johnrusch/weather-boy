/**
 * Prompt Display Component
 * Displays the current prompt and recording status
 */

import React from 'react';
import type { Prompt } from '../types/prompt';
import PromptTimer from './PromptTimer';

interface PromptDisplayProps {
  prompt: Prompt;
  currentIndex: number;
  totalPrompts: number;
  timeLeft: number;
  isRecording: boolean;
  onSkip: () => Promise<void>;
}

export function PromptDisplay({
  prompt,
  currentIndex,
  totalPrompts,
  timeLeft,
  isRecording,
  onSkip
}: PromptDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Prompt {currentIndex + 1} of {totalPrompts}
        </div>
        <div className="flex items-center">
          {isRecording && (
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-600">Recording...</span>
            </div>
          )}
          <button
            onClick={onSkip}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Skip →
          </button>
        </div>
      </div>
      
      {/* Timer */}
      <PromptTimer 
        timeLeft={timeLeft} 
        totalDuration={prompt.duration}
        className="mb-6" 
      />
      
      {/* Prompt text */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Speak the following:</h3>
        <p className="text-xl font-medium text-gray-800">{prompt.text}</p>
        
        {prompt.hint && (
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">Hint:</span> {prompt.hint}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptDisplay;
