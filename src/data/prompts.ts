import { Prompt } from "../types/prompt";

// Update the Prompt type to include difficulty and language
export interface PromptWithDifficulty extends Prompt {
  difficulty: "beginner" | "intermediate" | "advanced";
  language: "french" | "spanish";
}

// French prompts
export const frenchPrompts: PromptWithDifficulty[] = [
  // Beginner-friendly prompts (more straightforward, personal topics)
  {
    text: "What's a moment in your life that felt ordinary but, looking back, was pivotal in shaping who you are today?",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "Describe a memory you have that feels like it belongs to someone else.",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "What would your alter ego be named, and what would their most impressive talent be?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "If you could change the ending of any famous story, which would it be and how would you change it?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner",
    language: "french",
  },

  // Intermediate prompts (require more complex explanations)
  {
    text: "If you could communicate with your future self only once, what question would you ask?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "Imagine that happiness is a tangible object. What would it look, sound, and feel like?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "If memories could be traded like currency, which memory would you never sell, and why?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "You stumble upon a diary that can only be written in under moonlight. What would be your first entry?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "Invent a new holiday and explain how it's celebrated and why it exists.",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate",
    language: "french",
  },

  // Advanced prompts (require abstract thinking and complex explanations)
  {
    text: "If every time you spoke, a small animal gave you feedback on your answer, which animal would it be and what would they say right now?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "You find a button that, when pressed, teleports you to the last place you felt truly content. Would you press it, and if so, where would you end up?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "If your dreams each night were broadcasted live, what genre of show would they resemble and what would people think?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "If you could erase one habit from everyone on Earth, what would it be and how would it change daily life?",
    duration: 300,
    category: "Reflection",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "You wake up one day and find out you have the ability to talk to plants. What's the first conversation you have?",
    duration: 300,
    category: "Creative",
    difficulty: "advanced",
    language: "french",
  },

  // New Beginner Prompts
  {
    text: "Describe your favorite meal. Who prepared it, and why do you love it?",
    duration: 300,
    category: "Personal",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "What's your favorite way to spend a weekend? Describe a perfect day off.",
    duration: 300,
    category: "Lifestyle",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "Talk about a family tradition or a holiday that is special to you.",
    duration: 300,
    category: "Culture",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "If you could adopt any pet, real or imaginary, what would it be and why?",
    duration: 300,
    category: "Creative",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "Describe your favorite place in your hometown and what makes it special.",
    duration: 300,
    category: "Personal",
    difficulty: "beginner",
    language: "french",
  },

  // New Intermediate Prompts
  {
    text: "Imagine you could live in any time period. Which one would you choose and why?",
    duration: 300,
    category: "Historical",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "If you had to explain your personality using only colors, which ones would you choose and why?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "What's a book, movie, or song that has profoundly influenced you? Describe how it changed your perspective.",
    duration: 300,
    category: "Reflection",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "If you were given the power to create a law that everyone must follow, what would it be and why?",
    duration: 300,
    category: "Societal",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "You're given the opportunity to swap lives with a famous person for one week. Who do you choose, and what do you do?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "intermediate",
    language: "french",
  },

  // New Advanced Prompts
  {
    text: "If languages had personalities, how would you describe the personality of French compared to another language you know?",
    duration: 300,
    category: "Linguistic",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "Imagine a world where emotions are visible as auras of light. How would this change human interaction?",
    duration: 300,
    category: "Philosophical",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "You're offered the chance to merge two completely unrelated fields of study to create something new. What would you combine, and what would the result be?",
    duration: 300,
    category: "Creative",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "What if every decision you made today was written in the sky for everyone to see? How would it change your actions?",
    duration: 300,
    category: "Reflection",
    difficulty: "advanced",
    language: "french",
  },
  {
    text: "Describe a utopia and a dystopia that could arise from the same technological advancement. How do they differ?",
    duration: 300,
    category: "Hypothetical",
    difficulty: "advanced",
    language: "french",
  },

  // Bonus Prompts
  {
    text: "You have to explain the internet to someone from the 1800s. What do you say?",
    duration: 300,
    category: "Historical",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "If animals could form governments, what kind of leader would a cat make? A dog?",
    duration: 300,
    category: "Creative",
    difficulty: "intermediate",
    language: "french",
  },
  {
    text: "Invent a superpower that seems useless at first but could actually be incredibly helpful. Explain its potential.",
    duration: 300,
    category: "Hypothetical",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "You are tasked with designing a theme park based on your favorite subject in school. What attractions would it have?",
    duration: 300,
    category: "Creative",
    difficulty: "beginner",
    language: "french",
  },
  {
    text: "What if human memories could be recorded and played back like videos? How would this affect relationships and society?",
    duration: 300,
    category: "Philosophical",
    difficulty: "advanced",
    language: "french",
  },
];

// Spanish prompts - adding a few examples (you can add more as needed)
export const spanishPrompts: PromptWithDifficulty[] = [
  // Beginner-friendly Spanish prompts
  {
    text: "¿Cuál es un momento en tu vida que pareció ordinario pero, mirando atrás, fue crucial para formar quien eres hoy?",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner",
    language: "spanish",
  },
  {
    text: "Describe un recuerdo que tienes que parece pertenecer a otra persona.",
    duration: 300,
    category: "Reflection",
    difficulty: "beginner",
    language: "spanish",
  },
  {
    text: "¿Cómo se llamaría tu alter ego y cuál sería su talento más impresionante?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner",
    language: "spanish",
  },
  {
    text: "Si pudieras cambiar el final de cualquier historia famosa, ¿cuál sería y cómo la cambiarías?",
    duration: 300,
    category: "Interview",
    difficulty: "beginner",
    language: "spanish",
  },

  // Intermediate Spanish prompts
  {
    text: "Si pudieras comunicarte con tu yo futuro solo una vez, ¿qué pregunta harías?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate",
    language: "spanish",
  },
  {
    text: "Imagina que la felicidad es un objeto tangible. ¿Cómo se vería, sonaría y se sentiría?",
    duration: 300,
    category: "Philosophical",
    difficulty: "intermediate",
    language: "spanish",
  },
];

// Combined prompts array - original code can reference this
export const prompts: PromptWithDifficulty[] = [
  ...frenchPrompts,
  ...spanishPrompts,
];

// Updated function to get random prompts by language and difficulty
export function getPromptsByLanguageAndDifficulty(
  language: "french" | "spanish",
  difficulty: "beginner" | "intermediate" | "advanced",
  count: number,
): PromptWithDifficulty[] {
  const languagePrompts = prompts.filter(
    (prompt) =>
      prompt.language === language && prompt.difficulty === difficulty,
  );

  const shuffled = [...languagePrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Updated function to get random prompts by language
export function getRandomPromptsByLanguage(
  language: "french" | "spanish",
  count: number,
): PromptWithDifficulty[] {
  const languagePrompts = prompts.filter(
    (prompt) => prompt.language === language,
  );
  const shuffled = [...languagePrompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Keep the original functions for backward compatibility
export function getPromptsByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced",
  count: number,
): PromptWithDifficulty[] {
  // Default to French if no language specified for backward compatibility
  return getPromptsByLanguageAndDifficulty("french", difficulty, count);
}

export function getRandomPrompts(count: number): Prompt[] {
  // Default to French if no language specified for backward compatibility
  return getRandomPromptsByLanguage("french", count);
}
