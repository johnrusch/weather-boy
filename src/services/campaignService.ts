/**
 * Campaign Service
 * Centralizes campaign management functionality for the language learning application
 */

import type { CampaignState } from '../types/campaign';
import { getInitialCampaignState, getCampaignLevelForLanguage } from '../data/campaignLevels';
import { updateProgress } from './api';
import type { SupportedLanguage } from './languageService';

/**
 * Initialize campaign state with language-specific levels
 */
export function initializeCampaignState(language: SupportedLanguage): CampaignState {
  const initialState = getInitialCampaignState();
  return {
    ...initialState,
    levels: getCampaignLevelForLanguage(initialState.levels, language)
  };
}

/**
 * Update campaign state based on progress response from API
 */
export function updateCampaignStateFromProgress(
  currentState: CampaignState,
  progressData: any
): CampaignState {
  return {
    ...currentState,
    progress: progressData.campaignProgress,
    levels: currentState.levels.map(level => ({
      ...level,
      isUnlocked: level.id === 1 || progressData.campaignProgress.completedLevels.includes(level.id - 1),
      bestScore: progressData.campaignProgress.bestScores[level.id],
    })),
  };
}

/**
 * Update campaign state after completing a level
 */
export function updateCampaignStateAfterLevelComplete(
  currentState: CampaignState,
  levelId: number,
  score: number
): CampaignState {
  const currentLevel = currentState.levels.find(l => l.id === levelId);
  
  if (!currentLevel) {
    console.error('Campaign level not found:', levelId);
    return currentState;
  }
  
  const isLevelPassed = score >= currentLevel.requiredScore;
  const isBestScore = !currentLevel.bestScore || score > currentLevel.bestScore;
  
  // Update levels
  const updatedLevels = currentState.levels.map(level => {
    if (level.id === currentLevel.id) {
      return {
        ...level,
        bestScore: isBestScore ? score : level.bestScore,
      };
    }
    if (isLevelPassed && level.id === currentLevel.id + 1) {
      return {
        ...level,
        isUnlocked: true,
      };
    }
    return level;
  });

  // Update progress
  const updatedProgress = {
    ...currentState.progress,
    completedLevels: isLevelPassed 
      ? [...new Set([...currentState.progress.completedLevels, currentLevel.id])]
      : currentState.progress.completedLevels,
    bestScores: {
      ...currentState.progress.bestScores,
      [currentLevel.id]: isBestScore ? score : (currentState.progress.bestScores[currentLevel.id] || 0),
    },
  };

  return {
    levels: updatedLevels,
    progress: updatedProgress,
  };
}

/**
 * Get feedback message after completing a level
 */
export function getLevelCompletionMessage(
  levelId: number,
  score: number,
  requiredScore: number,
  isBestScore: boolean
): string {
  if (score >= requiredScore) {
    return `Congratulations! You passed Level ${levelId} with a score of ${score}%!${
      isBestScore ? ' This is your new best score!' : ''
    }`;
  } else {
    return `You scored ${score}%. You need ${requiredScore}% to pass this level. Try again!`;
  }
}

/**
 * Save campaign progress to the database
 */
export async function saveCampaignProgress(
  levelId: number,
  score: number
): Promise<any> {
  try {
    return await updateProgress(levelId, score);
  } catch (error) {
    console.error('Failed to save campaign progress:', error);
    throw new Error('Failed to save progress. Please try again.');
  }
}
