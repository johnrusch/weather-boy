/**
 * Campaign Mode Component
 * Handles the campaign mode of the language learning application
 */

import React from 'react';
import { useCampaignSession } from '../hooks/useCampaignSession';
import CampaignLevelList from './CampaignLevelList';
import PromptDisplay from './PromptDisplay';
import TranscriptionResult from './TranscriptionResult';
import ProcessingIndicator from './ProcessingIndicator';

interface CampaignModeProps {
  onExit: () => void;
}

export function CampaignMode({ onExit }: CampaignModeProps) {
  // Use our campaign session hook to manage state
  const {
    campaignState,
    selectedLevel,
    isProcessing,
    processingStage,
    transcriptions,
    currentPromptIndex,
    timeLeft,
    levelCompletionMessage,
    selectLevel,
    startCampaignLevel,
    finishCampaignLevel,
    resetCampaignSession,
    handleNextPrompt
  } = useCampaignSession();
  
  // Handle starting a level
  const handleStartLevel = async () => {
    try {
      await startCampaignLevel();
    } catch (err) {
      console.error('Failed to start campaign level:', err);
    }
  };
  
  // Handle closing the component
  const handleClose = () => {
    resetCampaignSession();
    onExit();
  };
  
  // Render level selection UI
  const renderLevelSelection = () => (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Campaign Mode</h2>
      
      <div className="text-gray-600 mb-8 text-center max-w-md mx-auto">
        Complete levels to progress through the campaign. 
        Each level has different challenges and difficulty.
      </div>
      
      <CampaignLevelList
        levels={campaignState.levels}
        onSelectLevel={selectLevel}
        selectedLevelId={selectedLevel?.id}
      />
      
      <div className="mt-8 text-center">
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
  
  // Render level details UI
  const renderLevelDetails = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-2 text-center">Level {selectedLevel.id}: {selectedLevel.title}</h2>
        <p className="text-gray-600 mb-6 text-center">{selectedLevel.description}</p>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-6">
          <h3 className="text-lg font-medium mb-2">Level Requirements</h3>
          <p>Required score to pass: <span className="font-bold">{selectedLevel.requiredScore}%</span></p>
          <p>Number of prompts: <span className="font-bold">{selectedLevel.prompts.length}</span></p>
          
          {selectedLevel.bestScore !== undefined && (
            <div className="mt-4">
              <p>Your best score: <span className="font-bold">{selectedLevel.bestScore}%</span></p>
              {selectedLevel.bestScore >= selectedLevel.requiredScore ? (
                <p className="text-green-600">Level completed ✓</p>
              ) : (
                <p className="text-yellow-600">Level not yet passed</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => selectLevel(0)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Back to Levels
          </button>
          <button
            onClick={handleStartLevel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Level
          </button>
        </div>
      </div>
    );
  };
  
  // Render level in progress UI
  const renderLevelInProgress = () => {
    if (!selectedLevel || currentPromptIndex < 0 || currentPromptIndex >= selectedLevel.prompts.length) {
      return null;
    }
    
    const currentPrompt = selectedLevel.prompts[currentPromptIndex];
    
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Processing indicator */}
        {isProcessing && (
          <ProcessingIndicator 
            isProcessing={isProcessing}
            stage={processingStage}
          />
        )}
        
        {/* Level indicator */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold">Level {selectedLevel.id}: {selectedLevel.title}</h2>
        </div>
        
        {/* Active prompt */}
        <PromptDisplay
          prompt={currentPrompt}
          currentIndex={currentPromptIndex}
          totalPrompts={selectedLevel.prompts.length}
          timeLeft={timeLeft}
          isRecording={true} // Assuming always recording during active prompt
          onSkip={handleNextPrompt}
        />
        
        {/* Exit button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              resetCampaignSession();
              selectLevel(selectedLevel.id);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Abandon Level
          </button>
        </div>
      </div>
    );
  };
  
  // Render level completion UI
  const renderLevelCompletion = () => {
    if (!selectedLevel) return null;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Level {selectedLevel.id} Results</h2>
        
        {/* Level completion message */}
        {levelCompletionMessage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6 text-center">
            <p className="text-lg">{levelCompletionMessage}</p>
          </div>
        )}
        
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
            onClick={() => {
              resetCampaignSession();
              selectLevel(0); // Back to level selection
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Back to Levels
          </button>
          <button
            onClick={handleStartLevel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };
  
  // Determine which view to show
  if (!selectedLevel) {
    return renderLevelSelection();
  } else if (currentPromptIndex >= 0) {
    return renderLevelInProgress();
  } else if (transcriptions.length > 0 || levelCompletionMessage) {
    // Make sure we've processed the level results
    if (!levelCompletionMessage) {
      finishCampaignLevel();
    }
    return renderLevelCompletion();
  } else {
    return renderLevelDetails();
  }
}

export default CampaignMode;
