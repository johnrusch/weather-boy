# Changelog

All notable changes to this project will be documented in this file.

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

### Changed
- Renamed FrenchLearningApp to LanguageLearningApp for better semantics
- Updated prompt interfaces to support language selection
- Modified evaluation and flashcard APIs to work with the selected language
- Updated UI text to be language-agnostic

### Preserved
- Existing French learning functionality remains intact
- Campaign mode specification and implementation are unchanged
- All existing prompts and levels have been preserved
