# System Overview

## Language Learning Application

This document provides an overview of the language learning application architecture, components, and key features.

## Core Philosophy
The application focuses on teaching conversational languages (French and Spanish) through short, natural phrases (3-9 words) that form the building blocks of everyday communication. Rather than teaching isolated vocabulary or complex grammar rules, we emphasize learning through practical, commonly-used expressions.

## Architecture

### Frontend Components
- **LanguageLearningApp**: Main application component that manages the overall app state, audio recording, and session flow
- **PromptCard**: Displays practice prompts for users to respond to
- **SessionSettings**: Allows users to configure their practice session, including language selection
- **TranscriptionsList**: Displays transcriptions of user responses with evaluations
- **FlashcardsList**: Shows generated flashcards based on user responses
- **Timer**: Manages countdown timer for timed responses

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

## Dependencies
- **OpenAI API**: Used for transcription, evaluation, and flashcard generation
- **React**: Frontend UI library
- **Astro**: Server-side rendering and API routes
- **Tailwind CSS**: Styling framework

## Future Enhancements
- Support for additional languages
- Enhanced audio processing for better pronunciation feedback
- Expanded campaign levels for both languages
