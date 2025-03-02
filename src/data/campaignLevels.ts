import { CampaignLevel } from "../types/campaign";

export const initialCampaignLevels: CampaignLevel[] = [
  {
    id: 1,
    name: "Basic Introductions",
    description:
      "Learn essential phrases for introducing yourself and greeting others.",
    prompts: [
      {
        text: "Introduce yourself. Include your name, age, and where you're from.",
        duration: 120,
        category: "Introduction",
        language: "french",
      },
      {
        text: "Describe your family members (their names and relationships to you).",
        duration: 120,
        category: "Family",
        language: "french",
      },
      {
        text: "Tell me about your hobbies and what you like to do in your free time.",
        duration: 120,
        category: "Hobbies",
        language: "french",
      },
      {
        text: "Describe your daily routine, including when you wake up and what you do in the morning.",
        duration: 120,
        category: "Daily Life",
        language: "french",
      },
      {
        text: "Talk about your favorite foods and what you typically eat for breakfast, lunch, and dinner.",
        duration: 120,
        category: "Food",
        language: "french",
      },
    ],
    requiredScore: 70,
    isUnlocked: true,
  },
  {
    id: 2,
    name: "Home and Family",
    description:
      "Practice describing your home, family members, and daily life at home.",
    prompts: [
      {
        text: "Describe your home in detail, including the rooms and their contents.",
        duration: 120,
        category: "Home",
        language: "french",
      },
      {
        text: "Talk about your family's traditions and special occasions.",
        duration: 120,
        category: "Family",
        language: "french",
      },
      {
        text: "Describe a typical weekend at home with your family.",
        duration: 120,
        category: "Daily Life",
        language: "french",
      },
      {
        text: "Explain the household chores you're responsible for.",
        duration: 120,
        category: "Home",
        language: "french",
      },
      {
        text: "Talk about your favorite room in your house and why you like it.",
        duration: 120,
        category: "Home",
        language: "french",
      },
    ],
    requiredScore: 75,
    isUnlocked: false,
  },
  {
    id: 3,
    name: "Work and Daily Routine",
    description:
      "Learn to discuss your work life, schedule, and daily activities.",
    prompts: [
      {
        text: "Describe your job or studies in detail.",
        duration: 120,
        category: "Work",
        language: "french",
      },
      {
        text: "Explain your commute to work/school.",
        duration: 120,
        category: "Transportation",
        language: "french",
      },
      {
        text: "Talk about your workplace or school environment.",
        duration: 120,
        category: "Work",
        language: "french",
      },
      {
        text: "Describe your colleagues or classmates.",
        duration: 120,
        category: "Work",
        language: "french",
      },
      {
        text: "Discuss your future career goals.",
        duration: 120,
        category: "Work",
        language: "french",
      },
    ],
    requiredScore: 80,
    isUnlocked: false,
  },
];

export const getCampaignLevelForLanguage = (
  levels: CampaignLevel[],
  targetLanguage: string,
): CampaignLevel[] => {
  if (levels[0].prompts[0].language === targetLanguage) {
    return levels;
  }

  return levels.map((level) => ({
    ...level,
    description: level.description.replace(
      /French|Spanish/gi,
      targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1),
    ),
    prompts: level.prompts.map((prompt) => ({
      ...prompt,
      language: targetLanguage,
    })),
  }));
};

export function getInitialCampaignState(language = "french") {
  return {
    levels: getCampaignLevelForLanguage(initialCampaignLevels, language),
    progress: {
      currentLevel: 1,
      completedLevels: [],
      bestScores: {},
    },
  };
}
