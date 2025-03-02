/**
 * Free Practice Mode Component
 * Handles the free practice mode of the language learning application
 */

import React, { useState } from "react";
import {
  useLanguageSession,
  DEFAULT_SETTINGS,
} from "../hooks/useLanguageSession";
import PromptDisplay from "./PromptDisplay";
import TranscriptionResult from "./TranscriptionResult";
import ProcessingIndicator from "./ProcessingIndicator";

interface FreePracticeModeProps {
  onExit: () => void;
}

export function FreePracticeMode({ onExit }: FreePracticeModeProps) {
  // Session settings state
  const [showSettings, setShowSettings] = useState(false);

  // Use our language session hook to manage state
  const {
    settings,
    setSettings,
    selectedPrompts,
    currentPromptIndex,
    timeLeft,
    isRecording,
    isProcessing,
    processingStage,
    transcriptions,
    error,
    startPromptSession,
    handleNextPrompt,
    resetSession,
  } = useLanguageSession();

  // Handle starting a session
  const handleStartSession = async () => {
    try {
      await startPromptSession();
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  // Handle applying settings
  const handleApplySettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  // Handle closing the component
  const handleClose = () => {
    resetSession();
    onExit();
  };

  // Render settings UI
  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Session Settings</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number of Prompts
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={settings.promptCount}
          onChange={(e) =>
            setSettings({
              ...settings,
              promptCount: Math.min(
                10,
                Math.max(1, parseInt(e.target.value, 10) || 1),
              ),
            })
          }
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Prompt Duration (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={settings.promptDuration}
          onChange={(e) =>
            setSettings({
              ...settings,
              promptDuration: Math.min(
                10,
                Math.max(1, parseInt(e.target.value, 10) || 1),
              ),
            })
          }
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setSettings(DEFAULT_SETTINGS)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
        >
          Reset
        </button>
        <button
          onClick={() => setShowSettings(false)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Apply
        </button>
      </div>
    </div>
  );

  // Render start session UI
  const renderStartSession = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="text-2xl font-bold mb-6">Free Practice Mode</h2>

      <div className="text-gray-600 mb-8 text-center max-w-md">
        Practice your speaking skills with random prompts. Your responses will
        be evaluated and you'll receive personalized feedback.
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Settings
        </button>
        <button
          onClick={handleStartSession}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Practice
        </button>
      </div>

      <button
        onClick={handleClose}
        className="mt-8 text-gray-500 hover:text-gray-700"
      >
        ← Back to Menu
      </button>
    </div>
  );

  // Render session in progress UI
  const renderSessionInProgress = () => (
    <div className="container mx-auto px-4 py-8">
      {/* Processing indicator */}
      {isProcessing && (
        <ProcessingIndicator
          isProcessing={isProcessing}
          stage={processingStage}
        />
      )}

      {/* Active prompt */}
      {currentPromptIndex >= 0 &&
        currentPromptIndex < selectedPrompts.length && (
          <PromptDisplay
            prompt={selectedPrompts[currentPromptIndex]}
            currentIndex={currentPromptIndex}
            totalPrompts={selectedPrompts.length}
            timeLeft={timeLeft}
            isRecording={isRecording}
            onSkip={handleNextPrompt}
          />
        )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6">
          <p>{error}</p>
        </div>
      )}

      {/* Exit button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ← End Practice Session
        </button>
      </div>
    </div>
  );

  // Render completed session UI
  const renderCompletedSession = () => (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Practice Results</h2>

      {/* Transcription results */}
      <div className="mb-8">
        {transcriptions.map((transcription, index) => (
          <TranscriptionResult
            key={index}
            transcription={transcription}
            index={index}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={handleStartSession}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start New Session
        </button>
        <button
          onClick={handleClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );

  // Determine which view to show
  if (showSettings) {
    return renderSettings();
  } else if (currentPromptIndex >= 0 && (isRecording || isProcessing)) {
    return renderSessionInProgress();
  } else if (transcriptions.length > 0) {
    return renderCompletedSession();
  } else {
    return renderStartSession();
  }
}

export default FreePracticeMode;
