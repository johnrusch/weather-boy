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
  },

  // New Beginner Prompts
  {
    text: "Describe your favorite meal. Who prepared it, and why do you love it?",
    duration: 300,
    category: "Personal",
    difficulty: "beginner"
  },
  {
    text: "What's your favorite way to spend a weekend? Describe a perfect day off.",
    duration: 300,
    category: "Lifestyle",
    difficulty: "beginner"
  },
  {
    text: "Talk about a family tradition or a holiday that is special to you.",
    duration: 300,
    category: "Culture",
    difficulty: "beginner"
  },
  {
    text: "If you could adopt any pet, real or imaginary, what would it be and why?",
    duration: 300,
    category: "Creative",
    difficulty: "beginner"
  },
  {
    text: "Describe your favorite place in your hometown and what makes it special.",
    duration: 300,
    category: "Personal",
    difficulty: "beginner"
  },

  // New Intermediate Prompts
  {
    text: "Imagine you could live in any time period. Which one would you choose and why?",
    duration: 300,
    category: "Historical",
    difficulty: "intermediate"
  },
  {
    text: "If you had to explain your personality using only colors, which ones would you choose and why?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate"
  },
  {
    text: "What's a book, movie, or song that has profoundly influenced you? Describe how it changed your perspective.",
    duration: 300,
    category: "Reflection",
    difficulty: "intermediate"
  },
  {
    text: "If you were given the power to create a law that everyone must follow, what would it be and why?",
    duration: 300,
    category: "Societal",
    difficulty: "intermediate"
  },
  {
    text: "You're given the opportunity to swap lives with a famous person for one week. Who do you choose, and what do you do?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "intermediate"
  },

  // New Advanced Prompts
  {
    text: "If languages had personalities, how would you describe the personality of French compared to another language you know?",
    duration: 300,
    category: "Linguistic",
    difficulty: "advanced"
  },
  {
    text: "Imagine a world where emotions are visible as auras of light. How would this change human interaction?",
    duration: 300,
    category: "Philosophical",
    difficulty: "advanced"
  },
  {
    text: "You're offered the chance to merge two completely unrelated fields of study to create something new. What would you combine, and what would the result be?",
    duration: 300,
    category: "Creative",
    difficulty: "advanced"
  },
  {
    text: "What if every decision you made today was written in the sky for everyone to see? How would it change your actions?",
    duration: 300,
    category: "Reflection",
    difficulty: "advanced"
  },
  {
    text: "Describe a utopia and a dystopia that could arise from the same technological advancement. How do they differ?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced"
  },

  // Bonus Prompts
  {
    text: "You have to explain the internet to someone from the 1800s. What do you say?",
    duration: 300,
    category: "Historical",
    difficulty: "beginner"  // Simplified to single difficulty for implementation
  },
  {
    text: "If animals could form governments, what kind of leader would a cat make? A dog?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate"  // Chose intermediate as primary difficulty
  },
  {
    text: "Invent a superpower that seems useless at first but could actually be incredibly helpful. Explain its potential.",
    duration: 300,
    category: "Hypothetical",
    difficulty: "beginner"  // Chose beginner as primary difficulty
  },
  {
    text: "You are tasked with designing a theme park based on your favorite subject in school. What attractions would it have?",
    duration: 300,
    category: "Creative",
    difficulty: "beginner"
  },
  {
    text: "What if human memories could be recorded and played back like videos? How would this affect relationships and society?",
    duration: 300,
    category: "Philosophical",
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