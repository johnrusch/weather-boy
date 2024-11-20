# Campaign Mode Feature Specification

## Overview
Implement a structured learning progression system ("Campaign Mode") while maintaining the existing free-form practice functionality. The system will organize French language prompts into progressive levels and track user advancement through these levels.

## Core Philosophy
The app focuses on teaching conversational French through short, natural phrases (3-9 words) that form the building blocks of everyday communication. Rather than teaching isolated vocabulary or complex grammar rules, we emphasize learning through practical, commonly-used expressions.

## Design Principles
1. **Short and Sweet**: All phrases, both prompts and flashcards, should be 3-9 words long to match natural conversation patterns.
2. **Practical First**: Focus on high-frequency expressions that native speakers actually use.
3. **Progressive Learning**: Start with basic expressions and gradually build complexity.
4. **Immediate Feedback**: Provide quick, actionable feedback on pronunciation and usage.
5. **Spaced Repetition**: Use flashcards to reinforce learning of key phrases and expressions.

## Core Features

### 1. Practice Modes

#### Campaign Mode (New)
- Organize prompts into sequential learning levels
- Each level contains 5 prompts
- Fixed response time of 1-2 minutes per prompt
- Levels progress from beginner to advanced topics
- Example Level Progression:
  - Level 1: Basic Introductions
  - Level 2: Home and Family
  - Level 3: Work and Daily Routine
  - Level 4: Hobbies and Interests
  - Level 5: Current Events and Opinions

#### Free Practice Mode (Existing)
- Maintain current functionality
- User-defined number of prompts
- User-defined response duration
- Random selection from available prompts
- Difficulty-based filtering option

### 2. Progress System
- Users must achieve a passing score to unlock the next level
- Track completion status for each level
- Store user progress in MongoDB Atlas
- Prevent access to locked levels
- Allow replay of completed levels
- Track and display user's best scores

### 3. Enhanced Scoring System
#### Current Features to Retain
- Response accuracy evaluation
- French language percentage tracking
- Prompt relevance assessment
- Detailed feedback generation

#### New Features
- Level-specific scoring criteria
- Progress tracking in user profile
- Historical performance analytics
- Achievement milestones
- Required passing scores for level progression

### 4. Flashcard Integration
#### Current Features to Retain
- Automatic flashcard generation from mistakes
- Multiple flashcard types (correction, translation, variation)
- Original context preservation

#### New Features
- Level-specific flashcard collections
- Required flashcard practice before level retries
- Flashcard mastery tracking
- Integration with level progression
- Practice recommendations based on performance

### 5. Data Storage
- Utilize existing MongoDB Atlas infrastructure
- New collections and schema updates:
  ```typescript
  interface Prompt {
    id: string;
    levelId: number;
    text: string;
    requiredVocabulary?: string[];
    suggestedResponseTime: number;
    category: string;
  }

  interface Level {
    id: number;
    name: string;
    description: string;
    prompts: string[]; // Array of Prompt IDs
    passingScore: number;
    unlockRequirements: {
      previousLevelId?: number;
      minimumScore?: number;
    };
  }

  interface UserProgress {
    userId: string;
    levelId: number;
    attempts: {
      date: Date;
      score: number;
      completedPrompts: string[];
      flashcardsGenerated: string[]; // Array of Flashcard IDs
    }[];
    unlocked: boolean;
    completed: boolean;
    bestScore: number;
  }

  interface Flashcard {
    id: string;
    levelId: number;
    french: string;
    english: string;
    type: 'correction' | 'translation' | 'variation';
    originalText?: string;
    mastered: boolean;
    lastPracticed?: Date;
  }
  ```

## User Experience

### Mode Selection
1. User chooses between:
   - Campaign Mode (structured progression)
   - Free Practice (existing functionality)

### Campaign Mode Flow
1. User selects available level
2. Completes all 5 prompts in sequence
3. Receives score and feedback
4. If passing score achieved:
   - Next level unlocked
   - Celebration/achievement notification
   - Option to proceed or review
5. If not passed:
   - Feedback on areas for improvement
   - Generated flashcards for practice
   - Required flashcard practice session
   - Option to retry level

### Free Practice Flow (Existing)
1. User selects:
   - Number of prompts
   - Time per prompt
   - Optional difficulty filter
2. Completes session
3. Receives feedback and flashcards

## Technical Requirements

### Database Updates
- Migrate prompts to MongoDB Atlas
- New collections for:
  - Levels
  - UserProgress
  - Campaign-specific Flashcards

### API Endpoints
- GET /api/modes - List available practice modes
- GET /api/levels - List all levels
- GET /api/levels/:id - Get specific level details
- GET /api/user/progress - Get user's progress
- POST /api/user/level/:id/attempt - Submit level attempt
- GET /api/user/flashcards/:levelId - Get level-specific flashcards
- POST /api/user/flashcards/practice - Submit flashcard practice results

### Frontend Components
- Mode selection interface
- Campaign Mode dashboard
- Level selection interface
- Progress visualization
- Achievement/unlock notifications
- Level-specific flashcard review
- Practice mode recommendation

## Future Considerations
- Adaptive difficulty based on performance
- Social features (leaderboards, friend progress)
- Achievement badges
- Custom level creation
- Time-based challenges
- Speaking accuracy scoring
- Pronunciation feedback
- Spaced repetition for flashcards
- Integration with external French learning resources
