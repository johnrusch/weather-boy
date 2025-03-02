# System Overview

## Language Learning Application

This document provides an overview of the language learning application architecture, components, and key features.

## Core Philosophy
The application focuses on teaching conversational languages (French and Spanish) through short, natural phrases (3-9 words) that form the building blocks of everyday communication. Rather than teaching isolated vocabulary or complex grammar rules, we emphasize learning through practical, commonly-used expressions.

## Architecture

### Frontend Components

#### Core Components
- **LanguageLearningApp**: Main application component that serves as a router for different modes
- **MainMenu**: Provides the mode selection interface 
- **FreePracticeMode**: Manages the free practice session flow
- **CampaignMode**: Manages the campaign mode session flow

#### UI Components
- **PromptDisplay**: Displays practice prompts for users to respond to
- **PromptTimer**: Shows countdown timer with progress indicator
- **ProcessingIndicator**: Displays the current processing stage
- **TranscriptionResult**: Shows a single transcription with its evaluation and flashcards
- **CampaignLevelList**: Displays campaign levels with their status

#### Layout/Common Components
- **HeaderLanguageSelector**: Allows language switching from any page
- **PromptCard**: Displays individual prompts
- **SessionSettings**: Allows users to configure their practice session
- **TranscriptionsList**: Displays transcriptions of user responses with evaluations
- **FlashcardsList**: Shows generated flashcards based on user responses

### Service Layer
- **languageService**: Centralizes language-related utilities and state management
- **recordingService**: Manages audio recording functionality
- **promptService**: Handles prompt management and timer calculations
- **campaignService**: Manages campaign-specific logic and state updates
- **api**: Centralizes all API calls with consistent error handling

### Custom Hooks
- **useLanguage**: Provides access to the language context
- **useLanguageSession**: Manages the language learning session state
- **useCampaignSession**: Manages campaign-specific session functionality

### Backend APIs
- **/api/transcribe**: Transcribes audio recordings to text
- **/api/evaluate**: Evaluates user responses, providing scoring and feedback based on selected language
- **/api/flashcards**: Generates language-specific flashcards based on user responses
- **/api/campaign-flashcards**: Generates flashcards specifically for campaign mode
- **/api/progress**: Tracks user progress in campaign mode
- **/api/saved-flashcards**: Manages saved flashcards for later review

### Data Models
- **Prompt**: Contains text prompts, duration, category, and language (French or Spanish)
- **Transcription**: User response data, including evaluation and flashcards
- **Evaluation**: Scoring and feedback on user responses
- **Flashcard**: Language learning cards with target language, English translation, and type
- **CampaignState**: Tracks user progress through structured learning levels

## Practice Modes

### Free Practice Mode
- User-configurable number of prompts and response duration
- Random selection from available prompts by language
- Instant evaluation and flashcard generation

### Campaign Mode
- Structured progression through sequential levels
- Each level contains 5 prompts with fixed response time
- Levels progress from beginner to advanced topics
- Users must achieve a passing score to unlock next level

## Language Support
The application now supports both French and Spanish language learning with the following features:
- Language-specific prompts organized by difficulty level
- Language-appropriate evaluation of responses
- Language-specific flashcard generation
- UI for switching between languages

## Testing Infrastructure

### Automated Testing
- **Unit Tests**: Tests for individual API endpoints using Vitest
- **Flashcard Generation Testing Suite**: Specialized tools for testing the flashcard generation functionality
  - Predefined test cases for both French and Spanish with varying levels of correctness
  - Custom text testing capability for quick evaluation of specific language samples
  - Results analysis tools for evaluating flashcard quality

### Test Cases
- **Perfect language**: Grammatically correct sentences
- **Minor errors**: Sentences with small grammatical issues
- **Major errors**: Sentences with significant grammatical problems
- **Mixed language**: Target language mixed with English words
- **Beginner level**: Simple sentences with typical beginner mistakes

## Dependencies
- **OpenAI API**: Used for transcription, evaluation, and flashcard generation
- **React**: Frontend UI library
- **Astro**: Server-side rendering and API routes
- **Tailwind CSS**: Styling framework
- **Vitest**: Testing framework

## Future Enhancements
- Support for additional languages
- Enhanced audio processing for better pronunciation feedback
- Expanded campaign levels for both languages
- Advanced testing capabilities for all application features
