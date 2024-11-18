import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import FrenchLearningApp from '../FrenchLearningApp';
import { getRandomPrompts } from '../../data/prompts';

// Mock the getRandomPrompts function
vi.mock('../../data/prompts', () => ({
  getRandomPrompts: vi.fn().mockReturnValue([
    { id: 1, text: 'Comment allez-vous?', translation: 'How are you?' },
    { id: 2, text: 'Je vais bien', translation: 'I am well' },
  ]),
}));

describe('FrenchLearningApp', () => {
  it('renders session settings form initially', () => {
    render(<FrenchLearningApp />);
    
    // Check for form elements
    expect(screen.getByLabelText(/Number of Prompts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Response Time/i)).toBeInTheDocument();
  });

  it('starts a session when settings are submitted', () => {
    render(<FrenchLearningApp />);
    
    // Fill out and submit settings form
    fireEvent.change(screen.getByLabelText(/Number of Prompts/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Response Time/i), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /Start Session/i }));

    // Verify prompts were fetched
    expect(getRandomPrompts).toHaveBeenCalledWith(3);
  });
});
