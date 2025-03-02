/**
 * Campaign Session Hook
 * Custom hook for managing campaign-specific language learning sessions
 *
 * This hook builds on top of useLanguageSession to provide campaign-specific
 * functionality such as level selection, progress tracking, and campaign state management.
 * It handles the structured learning path of the campaign mode, including level unlocking,
 * scoring, and flashcard review requirements.
 *
 * @returns {CampaignSessionState} Campaign session state and methods
 * @property {CampaignState} campaignState - Current state of the campaign including levels
 * @property {CampaignLevel|null} selectedLevel - Currently selected campaign level
 * @property {boolean} showFlashcardReview - Whether to show flashcard review before level
 * @property {boolean} isLevelComplete - Whether current level is completed
 * @property {string|null} completionMessage - Message to show on level completion
 * @property {Function} loadCampaignState - Load campaign state from server
 * @property {Function} selectLevel - Select a campaign level to play
 * @property {Function} completeFlashcardReview - Complete flashcard review and proceed
 * @property {Function} returnToLevelSelect - Return to level selection screen
 * @property {Function} resetCampaignSession - Reset the campaign session state
 */

import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useLanguageSession, type ProcessingStage } from "./useLanguageSession";
import { formatCampaignPrompts } from "../services/promptService";
import {
  initializeCampaignState,
  updateCampaignStateAfterLevelComplete,
  saveCampaignProgress,
  getLevelCompletionMessage,
} from "../services/campaignService";
import type { CampaignLevel, CampaignState } from "../types/campaign";

export interface CampaignSessionState {
  // Campaign state
  campaignState: CampaignState;

  // Level selection
  selectedLevel: CampaignLevel | null;

  // Derived from useLanguageSession
  isProcessing: boolean;
  processingStage: ProcessingStage;
  transcriptions: any[];
  currentPromptIndex: number;
  timeLeft: number;

  // Feedback
  levelCompletionMessage: string | null;

  // Session actions
  selectLevel: (levelId: number) => void;
  startCampaignLevel: () => Promise<void>;
  finishCampaignLevel: () => Promise<void>;
  resetCampaignSession: () => void;

  // From language session
  handleNextPrompt: () => Promise<void>;
}

export function useCampaignSession(): CampaignSessionState {
  // Get language from context
  const { language } = useLanguage();

  // Use base language session
  const languageSession = useLanguageSession();

  // Campaign-specific state
  const [campaignState, setCampaignState] = useState<CampaignState>(
    initializeCampaignState(language),
  );
  const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(
    null,
  );
  const [levelCompletionMessage, setLevelCompletionMessage] = useState<
    string | null
  >(null);

  // Load campaign state when language changes
  useEffect(() => {
    setCampaignState(initializeCampaignState(language));
    setSelectedLevel(null);
    setLevelCompletionMessage(null);
  }, [language]);

  // Select a campaign level
  const selectLevel = useCallback(
    (levelId: number) => {
      const level = campaignState.levels.find((l) => l.id === levelId);
      if (level) {
        setSelectedLevel(level);
        // Clear any previous completion message
        setLevelCompletionMessage(null);
      }
    },
    [campaignState.levels],
  );

  // Start a campaign level
  const startCampaignLevel = useCallback(async () => {
    if (!selectedLevel) {
      console.error("No level selected");
      return;
    }

    // Reset session first
    languageSession.resetSession();

    try {
      const formattedPrompts = formatCampaignPrompts(
        selectedLevel.prompts,
        language,
        languageSession.settings.promptDuration,
      );

      // Validate prompts
      if (formattedPrompts.length === 0) {
        throw new Error("No prompts available for this level");
      }

      // Set up session with level prompts
      await languageSession.startPromptSession();
    } catch (error) {
      console.error("Error starting campaign level:", error);
    }
  }, [selectedLevel, language, languageSession]);

  // Finish a campaign level
  const finishCampaignLevel = useCallback(async () => {
    if (!selectedLevel || languageSession.transcriptions.length === 0) {
      return;
    }

    try {
      // Calculate score based on evaluations
      const totalScore = languageSession.transcriptions.reduce(
        (sum, transcription) => sum + (transcription.evaluation?.score || 0),
        0,
      );

      const averageScore = Math.round(
        totalScore / languageSession.transcriptions.length,
      );

      // Check if this is a new best score
      const currentBestScore =
        campaignState.progress.bestScores[selectedLevel.id] || 0;
      const isBestScore = averageScore > currentBestScore;

      // Create feedback message
      const message = getLevelCompletionMessage(
        selectedLevel.id,
        averageScore,
        selectedLevel.requiredScore,
        isBestScore,
      );

      setLevelCompletionMessage(message);

      // Update local campaign state
      const updatedState = updateCampaignStateAfterLevelComplete(
        campaignState,
        selectedLevel.id,
        averageScore,
      );

      setCampaignState(updatedState);

      // Save progress to the server
      await saveCampaignProgress(selectedLevel.id, averageScore);
    } catch (error) {
      console.error("Error finishing campaign level:", error);
    }
  }, [selectedLevel, languageSession.transcriptions, campaignState]);

  // Reset the campaign session
  const resetCampaignSession = useCallback(() => {
    languageSession.resetSession();
    setLevelCompletionMessage(null);
  }, [languageSession]);

  return {
    // Campaign state
    campaignState,

    // Level selection
    selectedLevel,

    // Derived from language session
    isProcessing: languageSession.isProcessing,
    processingStage: languageSession.processingStage,
    transcriptions: languageSession.transcriptions,
    currentPromptIndex: languageSession.currentPromptIndex,
    timeLeft: languageSession.timeLeft,

    // Feedback
    levelCompletionMessage,

    // Session actions
    selectLevel,
    startCampaignLevel,
    finishCampaignLevel,
    resetCampaignSession,

    // From language session
    handleNextPrompt: languageSession.handleNextPrompt,
  };
}
