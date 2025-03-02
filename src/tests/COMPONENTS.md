# Component Testing Guidelines

This document provides guidelines for testing the refactored components of the language learning application.

## Testing Strategy

After refactoring the LanguageLearningApp component into smaller components and a service-oriented architecture, tests need to be updated to reflect the new structure. Here's the recommended testing approach:

### 1. Unit Testing Components

Each component should be tested in isolation:

```tsx
// Example test for MainMenu.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from '../components/MainMenu';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('MainMenu', () => {
  test('renders correctly', () => {
    const mockSelectMode = jest.fn();
    
    render(
      <LanguageProvider>
        <MainMenu onSelectMode={mockSelectMode} />
      </LanguageProvider>
    );
    
    expect(screen.getByText('Campaign Mode')).toBeInTheDocument();
    expect(screen.getByText('Free Practice')).toBeInTheDocument();
  });
  
  test('calls onSelectMode with correct mode', () => {
    const mockSelectMode = jest.fn();
    
    render(
      <LanguageProvider>
        <MainMenu onSelectMode={mockSelectMode} />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByText('Start Campaign →'));
    expect(mockSelectMode).toHaveBeenCalledWith('campaign');
    
    fireEvent.click(screen.getByText('Start Practice →'));
    expect(mockSelectMode).toHaveBeenCalledWith('practice');
  });
});
```

### 2. Testing Services

Services should be tested separately from components:

```tsx
// Example test for languageService.ts
import { isValidLanguage, getStoredLanguage } from '../services/languageService';

describe('languageService', () => {
  test('isValidLanguage returns correct results', () => {
    expect(isValidLanguage('french')).toBe(true);
    expect(isValidLanguage('spanish')).toBe(true);
    expect(isValidLanguage('german')).toBe(false);
    expect(isValidLanguage('')).toBe(false);
  });
  
  test('getStoredLanguage returns default language when nothing stored', () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
      },
      writable: true
    });
    
    expect(getStoredLanguage('french')).toBe('french');
  });
});
```

### 3. Testing Custom Hooks

Custom hooks should be tested using `@testing-library/react-hooks`:

```tsx
// Example test for useLanguageSession hook
import { renderHook, act } from '@testing-library/react-hooks';
import { useLanguageSession } from '../hooks/useLanguageSession';

describe('useLanguageSession', () => {
  test('initializes with default settings', () => {
    const { result } = renderHook(() => useLanguageSession());
    
    expect(result.current.settings).toEqual({
      promptCount: 4,
      promptDuration: 5
    });
  });
  
  test('allows settings to be updated', () => {
    const { result } = renderHook(() => useLanguageSession());
    
    act(() => {
      result.current.setSettings({
        promptCount: 6,
        promptDuration: 3
      });
    });
    
    expect(result.current.settings).toEqual({
      promptCount: 6,
      promptDuration: 3
    });
  });
});
```

### 4. Integration Testing

Integration tests should verify that components work together:

```tsx
// Example integration test
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageLearningApp } from '../components/LanguageLearningApp';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('LanguageLearningApp Integration', () => {
  test('navigates from menu to practice mode', async () => {
    render(
      <LanguageProvider>
        <LanguageLearningApp />
      </LanguageProvider>
    );
    
    // Should start with menu
    expect(screen.getByText('Campaign Mode')).toBeInTheDocument();
    
    // Navigate to practice mode
    fireEvent.click(screen.getByText('Start Practice →'));
    
    // Should now show practice mode content
    expect(await screen.findByText('Free Practice Session')).toBeInTheDocument();
  });
});
```

## Mock Services

For testing components that depend on services, create mocks:

```tsx
// Example mock for api.ts
jest.mock('../services/api', () => ({
  transcribeAudio: jest.fn().mockResolvedValue({
    text: 'Mocked transcription'
  }),
  evaluateResponse: jest.fn().mockResolvedValue({
    score: 0.85,
    feedback: 'Good pronunciation'
  }),
  generateFlashcards: jest.fn().mockResolvedValue([
    { term: 'bonjour', definition: 'hello' }
  ])
}));
```

## Storybook Integration

Component stories in Storybook can be used as a form of visual testing:

```bash
# Run storybook
npm run storybook

# Build storybook for visual regression testing
npm run build-storybook
```

By following these guidelines, you'll maintain and improve test coverage as the application evolves.
