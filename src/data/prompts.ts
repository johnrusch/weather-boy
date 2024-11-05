import { Prompt } from '../types/prompt';

// Update the Prompt type to include difficulty
export interface PromptWithDifficulty extends Prompt {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const prompts: PromptWithDifficulty[] = [
  // Beginner-friendly prompts (more straightforward, personal topics)
  {
    text: "What's a moment in your life that felt ordinary but, looking back, was pivotal in shaping who you are today?",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner"
  },
  {
    text: "Describe a memory you have that feels like it belongs to someone else.",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner"
  },
  {
    text: "What would your alter ego be named, and what would their most impressive talent be?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner"
  },
  {
    text: "If you could change the ending of any famous story, which would it be and how would you change it?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner"
  },
  
  // Intermediate prompts (require more complex explanations)
  {
    text: "If you could communicate with your future self only once, what question would you ask?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate"
  },
  {
    text: "Imagine that happiness is a tangible object. What would it look, sound, and feel like?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate"
  },
  {
    text: "If memories could be traded like currency, which memory would you never sell, and why?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate"
  },
  {
    text: "You stumble upon a diary that can only be written in under moonlight. What would be your first entry?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate"
  },
  {
    text: "Invent a new holiday and explain how it's celebrated and why it exists.",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate"
  },
  
  // Advanced prompts (require abstract thinking and complex explanations)
  {
    text: "If every time you spoke, a small animal gave you feedback on your answer, which animal would it be and what would they say right now?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced"
  },
  {
    text: "You find a button that, when pressed, teleports you to the last place you felt truly content. Would you press it, and if so, where would you end up?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced"
  },
  {
    text: "If your dreams each night were broadcasted live, what genre of show would they resemble and what would people think?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced"
  },
  {
    text: "If you could erase one habit from everyone on Earth, what would it be and how would it change daily life?",
    duration: 300,
    category: "Reflection",
    difficulty: "advanced"
  },
  {
    text: "You wake up one day and find out you have the ability to talk to plants. What's the first conversation you have?",
    duration: 300,
    category: "Creative",
    difficulty: "advanced"
  }
];

// Updated function to get random prompts by difficulty
export const getPromptsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced', count: number): PromptWithDifficulty[] => {
  const filteredPrompts = prompts.filter(prompt => prompt.difficulty === difficulty);
  const shuffled = [...filteredPrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Keep the original function for backward compatibility
export const getRandomPrompts = (count: number): Prompt[] => {
  const shuffled = [...prompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};