import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FrenchLearningApp from '../FrenchLearningApp';
import { getRandomPrompts } from '../../data/prompts';
import { getInitialCampaignState } from '../../data/campaignLevels';

// Mock the getRandomPrompts function
vi.mock('../../data/prompts', () => ({
  getRandomPrompts: vi.fn().mockReturnValue([
    { id: 1, text: 'Comment allez-vous?', translation: 'How are you?' },
    { id: 2, text: 'Je vais bien', translation: 'I am well' },
  ]),
}));

// Mock the getInitialCampaignState function
vi.mock('../../data/campaignLevels', () => ({
  getInitialCampaignState: vi.fn().mockReturnValue({
    levels: [
      {
        id: 1,
        name: 'Basic Introductions',
        description: 'Learn essential French phrases',
        prompts: [
          { text: 'Introduce yourself', duration: 120, category: 'Introduction' },
          { text: 'Describe your family', duration: 120, category: 'Family' },
        ],
        requiredScore: 70,
        isUnlocked: true,
      },
      {
        id: 2,
        name: 'Home and Family',
        description: 'Practice describing your home',
        prompts: [
          { text: 'Describe your home', duration: 120, category: 'Home' },
        ],
        requiredScore: 75,
        isUnlocked: false,
      },
    ],
    progress: {
      currentLevel: 1,
      completedLevels: [],
      bestScores: {},
    },
  }),
}));

// Mock fetch
const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      campaignProgress: {
        currentLevel: 1,
        completedLevels: [],
        bestScores: {},
      }
    }),
  })
);
global.fetch = mockFetch;

describe('FrenchLearningApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders practice mode selector initially', async () => {
    render(<FrenchLearningApp />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /campaign mode/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /free practice/i })).toBeInTheDocument();
    });
  });

  describe('Free Practice Mode', () => {
    it('shows session settings only after free practice mode is selected', async () => {
      render(<FrenchLearningApp />);
      
      // Session settings should not be visible initially
      expect(screen.queryByText('Session Settings')).not.toBeInTheDocument();
      
      // Select Free Practice mode
      await userEvent.click(screen.getByRole('button', { name: /free practice/i }));
      
      // Now session settings should be visible
      expect(screen.getByText('Session Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of Prompts')).toBeInTheDocument();
      expect(screen.getByLabelText('Response Time (minutes)')).toBeInTheDocument();
      expect(screen.getByText('Start Session')).toBeInTheDocument();
    });
  });

  describe('Campaign Mode', () => {
    it('displays campaign levels when campaign mode is selected', async () => {
      render(<FrenchLearningApp />);
      await userEvent.click(screen.getByRole('button', { name: /campaign mode/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Basic Introductions')).toBeInTheDocument();
        expect(screen.getByText('Home and Family')).toBeInTheDocument();
        expect(screen.getByText('Learn essential French phrases')).toBeInTheDocument();
      });
    });

    it('shows locked status for unavailable levels', async () => {
      render(<FrenchLearningApp />);
      await userEvent.click(screen.getByRole('button', { name: /campaign mode/i }));
      
      await waitFor(() => {
        expect(screen.getByText('🔒 Complete previous level')).toBeInTheDocument();
      });
    });

    it('allows starting an unlocked level', async () => {
      render(<FrenchLearningApp />);
      await userEvent.click(screen.getByRole('button', { name: /campaign mode/i }));
      
      await waitFor(() => {
        const startButton = screen.getByRole('button', { name: /start level/i });
        expect(startButton).toBeInTheDocument();
        expect(startButton).not.toBeDisabled();
      });
    });
  });

  it('allows returning to mode selection', async () => {
    render(<FrenchLearningApp />);
    
    // Go to Free Practice
    await userEvent.click(screen.getByRole('button', { name: /free practice/i }));
    expect(screen.getByText('Session Settings')).toBeInTheDocument();
    
    // Return to mode selection
    await userEvent.click(screen.getByText('← Change Practice Mode'));
    
    // Check that mode selection is visible again
    expect(screen.getByRole('button', { name: /campaign mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /free practice/i })).toBeInTheDocument();
  });
});
