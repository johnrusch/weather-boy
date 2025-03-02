# Changelog

All notable changes to this project will be documented in this file.

## [2025-03-02] - Language Synchronization Improvements
### Fixed
- Fixed critical issue where changing language from dropdown wouldn't properly update throughout the application
  - Purpose: To ensure language selections are consistently applied across the entire application
  - Affected files:
    - `src/layouts/SiteLayout.astro`: Removed duplicate language management script causing conflicts
    - `src/components/HeaderLanguageSelector.tsx`: Improved language change flow to update localStorage first
    - `src/contexts/LanguageContext.tsx`: Enhanced context/localStorage synchronization and validation
    - `src/scripts/languageManager.js`: Completely reworked for robust language state management
  - Changes:
    - Added clear visual feedback when language is changing
    - Implemented consistent order of operations (update localStorage → update context → trigger event → reload)
    - Added MutationObserver to catch dynamically added selectors
    - Added global debug function that can be called from console: `window.debugLanguage()`
    - Added periodic validation to automatically fix any language state inconsistencies
    - Improved error handling and user notifications
    - Extended delay before page reload to ensure all state updates are processed

## [2025-03-01] - Language Context Fixes
### Fixed
- Language context synchronization issue where Spanish was selected in UI but French was being used in the app
  - Purpose: To ensure the language selected in the dropdown is correctly applied throughout the application
  - Affected files:
    - `src/contexts/LanguageContext.tsx`: Improved synchronization with localStorage and validation of language values
    - `src/components/HeaderLanguageSelector.tsx`: Fixed to use context values directly instead of maintaining separate state
    - `src/scripts/languageManager.js`: Enhanced to manage all language selectors consistently
    - `src/components/LanguageLearningApp.tsx`: Updated to verify language from localStorage before using context
  - Added files:
    - `src/scripts/resetLanguage.js`: Utility script to reset language settings when issues occur
    - `src/pages/debug-language.tsx`: Debug tool page to diagnose and fix language selection issues
  - Changes:
    - Improved validation of language values from localStorage
    - Added cross-component communication via custom events
    - Fixed race condition between context updates and localStorage
    - Added more robust error handling and debugging
    - Added utility to reset language settings when needed

## [2025-03-01]
### Added
- Comprehensive transcription testing suite for code-switching scenarios
  - Purpose: To test and improve how the system handles mixing English words in target language contexts during transcription
  - Affected files:
    - `src/pages/api/transcribe.ts`: Improved prompt handling for code-switching
    - `src/tests/transcription-test.ts`: Added new testing utility
    - `src/tests/run-transcription-tests.ts`: Added test runner
    - `src/tests/generate-test-audio.ts`: Added utility to generate test audio files
    - `src/tests/TRANSCRIPTION-README.md`: Added detailed documentation
    - `package.json`: Added npm scripts
  - Features:
    - Test cases for preserving English words in French and Spanish transcriptions
    - Audio generation utility for creating test samples
    - Language-specific prompts for French and Spanish transcriptions
    - Enhanced handling of vocabulary gap scenarios where English words are used in target language contexts
    - Comprehensive documentation on testing approach

## [2025-03-01]
### Added
- Additional flashcard generation test cases for code-switching scenarios
  - Purpose: To test how the system handles mixing English words in target language contexts
  - Affected files:
    - `src/tests/flashcard-generator-test.ts`: Added new test cases
    - `src/tests/README.md`: Updated documentation
  - Features:
    - Test cases for vocabulary gaps in both French and Spanish
    - Test cases for natural code-switching between English and target languages
    - Enhanced documentation on mixed-language scenarios

## [2025-03-01]
### Added
- Comprehensive flashcard generation testing suite
  - Purpose: To enable independent testing of the flashcard generation functionality without using the full application flow
  - Affected files:
    - `src/pages/api/__tests__/flashcards.test.ts`: Unit tests for the flashcard API
    - `src/tests/flashcard-generator-test.ts`: Integration test utility with predefined test cases
    - `src/tests/run-flashcard-tests.ts`: Command-line tool to run tests
    - `src/tests/analyze-flashcard-results.ts`: Results analysis utility
    - `src/tests/test-custom-flashcards.ts`: Custom text testing utility
    - `src/tests/types.ts`: Type definitions
    - `src/tests/README.md`: Documentation
    - `src/tests/CHANGELOG.md`: Dedicated changelog
    - `SYSTEM_OVERVIEW.md`: Updated with testing information
    - `package.json`: Added npm scripts
  - Features:
    - Unit test coverage for the flashcard API endpoint
    - Predefined test cases for French and Spanish with varying correctness levels
    - Custom text testing for quick evaluation of specific phrases
    - Detailed results analysis and visualization
    - Comprehensive documentation

## [2025-02-27]
### Added
- Multi-language support for both French and Spanish learning
  - Purpose: To expand the application's functionality to support learning Spanish in addition to French
  - Affected files: 
    - `src/types/prompt.ts`: Updated types to include language field
    - `src/components/FrenchLearningApp.tsx` → `src/components/LanguageLearningApp.tsx`: Renamed and updated to support multiple languages
    - `src/data/prompts.ts`: Added Spanish prompts and language selection functions
    - `src/pages/api/evaluate.ts`: Updated to evaluate responses in both languages
    - `src/pages/api/flashcards.ts`: Updated to generate flashcards for both languages
    - `src/components/SessionSettings.tsx`: Added language selection UI
- Flashcard selection and download functionality in Campaign Mode
  - Purpose: To allow users to select specific flashcards for download after campaign practice sessions
  - Affected files:
    - `src/components/CampaignFlashcardReview.tsx`: Added selection UI and download functionality
  - Features:
    - Select/deselect individual flashcards
    - Select All / Deselect All buttons
    - Download selected flashcards as CSV
    - Visual indicators for selected cards
- Enhanced flashcard selection controls in FlashcardsList
  - Purpose: To improve user experience when selecting and saving flashcards
  - Affected files:
    - `src/components/FlashcardsList.tsx`: Enhanced selection functionality
  - Features:
    - Added "Select All" and "Deselect All" buttons
    - Made selection controls available to all users (not just logged-in users)
    - Added success message when downloading CSV
    - Improved selection UI and feedback
- Robust offline support and database error handling
  - Purpose: To ensure app functionality when MongoDB connection issues occur
  - Affected files:
    - `src/components/SavedFlashcards.tsx`: Added fallback to mock data
    - `src/pages/api/saved-flashcards.ts`: Improved error handling with mock data generation
  - Issue: MongoDB connection errors were causing the app to break when viewing flashcards
  - Solution: 
    - Added timeout handling to prevent long-running database operations
    - Created mock flashcard data for both Spanish and French languages
    - Improved error handling to gracefully degrade when offline
    - Ensured consistent user experience regardless of backend availability

### Changed
- Renamed FrenchLearningApp to LanguageLearningApp for better semantics
- Updated prompt interfaces to support language selection
- Modified evaluation and flashcard APIs to work with the selected language
- Updated UI text to be language-agnostic

### Fixed
- Error in SavedFlashcards component when viewing saved flashcards
  - Purpose: To prevent type errors when accessing properties of flashcards
  - Affected files:
    - `src/components/SavedFlashcards.tsx`: Updated to handle both targetLanguage and french properties
  - Issue: TypeError when accessing undefined properties due to changes in flashcard structure
  - Solution: Added fallbacks and null checks to prevent errors with different flashcard formats
- Enhanced SavedFlashcards component to organize flashcards by language
  - Purpose: To improve organization and make it easier to find flashcards by language
  - Affected files:
    - `src/components/SavedFlashcards.tsx`: Updated to group and display flashcards by language
  - Features:
    - Groups flashcards into sections by language (French, Spanish, etc.)
    - Added language filter buttons
    - Improved tag filtering with better UI
    - Visual separation and counts for each language section
- Integrated language context with SavedFlashcards component
  - Purpose: To only show flashcards for the currently selected app language
  - Affected files:
    - `src/components/SavedFlashcards.tsx`: Updated to use language context
  - Features:
    - By default only shows flashcards matching the current language in use
    - Toggle switch to view "All Languages" when needed
    - Automatic language detection for flashcards without explicit language property
    - Helpful message when no flashcards are found for the current language
- Fixed language context integration in SavedFlashcards page
  - Purpose: To ensure flashcards are correctly filtered by the current app language
  - Affected files:
    - `src/components/SavedFlashcards.tsx`: Improved language detection and filtering
    - `src/pages/flashcards.astro`: Updated to use the global language context
    - `src/components/LanguageLearningApp.tsx`: Refactored to use language context instead of direct localStorage access
    - `src/layouts/RootLayout.astro`: Added LanguageProvider at root layout level
    - `src/pages/index.astro`: Enhanced language provider setup
    - `src/layouts/SiteLayout.astro`: Fixed layout nesting and improved language selection
    - `src/contexts/LanguageContext.tsx`: Enhanced debugging and language selection
  - Issue: Language selection wasn't consistent across different pages of the application
  - Solution: Implemented a single source of truth for language selection by fixing layout structure and using client-side hydration
- Created dedicated client components for Language UI
  - Purpose: To ensure reliable language changing across the application
  - Added files:
    - `src/components/HeaderLanguageSelector.tsx`: New client component for changing language in the header
  - Enhanced implementation:
    - Improved synchronization with localStorage
    - Fixed HTML structure issues in layouts
    - Added comprehensive logging for debugging
    - Ensured consistent state management between different pages
- Fixed language selector issues with a more robust implementation
  - Purpose: To ensure language selection reliably works across all components
  - Affected files:
    - `src/components/HeaderLanguageSelector.tsx`: Enhanced to directly manipulate localStorage and force page reload
    - `src/contexts/LanguageContext.tsx`: Updated to handle storage events and custom events more reliably
    - `src/layouts/SiteLayout.astro`: Added inline script to initialize selectors
  - Issue: Language selection wasn't being properly reflected in the UI and components
  - Solution: Implemented a multi-layered approach with:
    - Direct localStorage updates
    - Page reload to ensure all components see the new language
    - Custom events for communication between components
    - Improved error handling and debugging
- Language selection bugs in Free Practice Mode
  - Purpose: To fix issues where Spanish-selected practice sessions were showing French flashcards
  - Affected files:
    - `src/components/LanguageLearningApp.tsx`: Modified to consistently use language from LanguageContext
    - `src/components/SessionSettings.tsx`: Removed language selection from settings
    - `src/types/prompt.ts`: Removed language field from SessionSettings type

- Session duration issues in practice modes
  - Purpose: To ensure sessions respect the user-selected duration (2 minutes instead of 5 minutes)
  - Affected files:
    - `src/components/LanguageLearningApp.tsx`: Added proper conversion from minutes to seconds and applied to all prompts

- Fixed prompt recording issues in Free Practice Mode
  - Purpose: To ensure all completed prompts are properly registered and processed
  - Affected files:
    - `src/components/LanguageLearningApp.tsx`: Fixed language consistency in processing recordings

### Preserved
- Existing French learning functionality remains intact
- Campaign mode specification and implementation are unchanged
- All existing prompts and levels have been preserved
