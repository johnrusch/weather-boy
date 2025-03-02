/**
 * Refactored Language Learning App Component
 * A simplified version of the original LanguageLearningApp that uses
 * the extracted components and services
 */

import React, { useState } from 'react';
import MainMenu from './MainMenu';
import FreePracticeMode from './FreePracticeMode';
import CampaignMode from './CampaignMode';

export default function LanguageLearningApp() {
  // Keep only the core state needed for mode switching
  const [activeMode, setActiveMode] = useState<'menu' | 'campaign' | 'practice'>('menu');
  
  // Handle mode selection
  const handleModeSelect = (mode: 'campaign' | 'practice') => {
    setActiveMode(mode);
  };
  
  // Handle returning to the main menu
  const handleReturnToMenu = () => {
    setActiveMode('menu');
  };
  
  // Render the appropriate component based on active mode
  return (
    <div className="container mx-auto py-6 px-4">
      {activeMode === 'menu' && (
        <MainMenu onSelectMode={handleModeSelect} />
      )}
      
      {activeMode === 'practice' && (
        <FreePracticeMode onExit={handleReturnToMenu} />
      )}
      
      {activeMode === 'campaign' && (
        <CampaignMode onExit={handleReturnToMenu} />
      )}
    </div>
  );
}
