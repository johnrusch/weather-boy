import { Prompt } from '../types/prompt';

export const prompts: Prompt[] = [
  // Philosophical Prompts
  {
    text: "If you could communicate with your future self only once, what question would you ask?",
    duration: 300,
    category: "Philosophical"
  },
  {
    text: "Imagine that happiness is a tangible object. What would it look, sound, and feel like?",
    duration: 300,
    category: "Philosophical"
  },
  {
    text: "If memories could be traded like currency, which memory would you never sell, and why?",
    duration: 300,
    category: "Philosophical"
  },
  // Hypothetical Scenarios
  {
    text: "If every time you spoke, a small animal gave you feedback on your answer, which animal would it be and what would they say right now?",
    duration: 300,
    category: "Hypothetical"
  },
  {
    text: "You find a button that, when pressed, teleports you to the last place you felt truly content. Would you press it, and if so, where would you end up?",
    duration: 300,
    category: "Hypothetical"
  },
  {
    text: "If your dreams each night were broadcasted live, what genre of show would they resemble and what would people think?",
    duration: 300,
    category: "Hypothetical"
  },
  // Unusual Interview Questions
  {
    text: "If you could change the ending of any famous story, which would it be and how would you change it?",
    duration: 300,
    category: "Interview"
  },
  {
    text: "What would your alter ego be named, and what would their most impressive talent be?",
    duration: 300,
    category: "Interview"
  },
  {
    text: "Imagine you have to live out the next year as a minor character in your favorite movie. Who are you, and what is your role?",
    duration: 300,
    category: "Interview"
  },
  // Personal Reflection
  {
    text: "What's a moment in your life that felt ordinary but, looking back, was pivotal in shaping who you are today?",
    duration: 300,
    category: "Reflection"
  },
  {
    text: "If you could erase one habit from everyone on Earth, what would it be and how would it change daily life?",
    duration: 300,
    category: "Reflection"
  },
  {
    text: "Describe a memory you have that feels like it belongs to someone else.",
    duration: 300,
    category: "Reflection"
  },
  // Creative Expression
  {
    text: "You stumble upon a diary that can only be written in under moonlight. What would be your first entry?",
    duration: 300,
    category: "Creative"
  },
  {
    text: "Invent a new holiday and explain how it's celebrated and why it exists.",
    duration: 300,
    category: "Creative"
  },
  {
    text: "You wake up one day and find out you have the ability to talk to plants. What's the first conversation you have?",
    duration: 300,
    category: "Creative"
  },
  // And so on for all other categories...
];

export const getRandomPrompts = (count: number): Prompt[] => {
  const shuffled = [...prompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};