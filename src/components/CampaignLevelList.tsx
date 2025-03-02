/**
 * Campaign Level List Component
 * Displays a list of campaign levels with their status
 */

import React from 'react';
import type { CampaignLevel } from '../types/campaign';

interface CampaignLevelListProps {
  levels: CampaignLevel[];
  onSelectLevel: (levelId: number) => void;
  selectedLevelId?: number | null;
}

export function CampaignLevelList({
  levels,
  onSelectLevel,
  selectedLevelId
}: CampaignLevelListProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Campaign Levels</h2>
      
      {levels.map((level) => {
        // Determine level status
        const isSelected = selectedLevelId === level.id;
        const isLocked = !level.isUnlocked;
        const hasBestScore = level.bestScore !== undefined;
        const isPassed = hasBestScore && level.bestScore >= level.requiredScore;
        
        // Determine appropriate styles based on status
        let cardClasses = "border rounded-lg p-4 transition-all";
        let scoreColor = "";
        
        if (isSelected) {
          cardClasses += " border-blue-500 bg-blue-50";
        } else if (isLocked) {
          cardClasses += " border-gray-300 bg-gray-100 opacity-75";
        } else if (isPassed) {
          cardClasses += " border-green-200 hover:border-green-400";
          scoreColor = "text-green-600";
        } else if (hasBestScore) {
          cardClasses += " border-yellow-200 hover:border-yellow-400";
          scoreColor = "text-yellow-600";
        } else {
          cardClasses += " border-gray-200 hover:border-gray-400";
        }
        
        return (
          <div
            key={level.id}
            className={cardClasses}
            onClick={() => !isLocked && onSelectLevel(level.id)}
            style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">
                  Level {level.id}: {level.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                
                {hasBestScore && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Best Score: </span>
                    <span className={`font-medium ${scoreColor}`}>
                      {level.bestScore}% {isPassed && '✓'}
                    </span>
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mt-1">
                  Required: {level.requiredScore}% to pass
                </div>
              </div>
              
              {isLocked ? (
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              ) : (
                <div className="text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CampaignLevelList;
