import { Prompt } from "./prompt";

export interface CampaignLevel {
  id: number;
  name: string;
  description: string;
  prompts: Prompt[];
  requiredScore: number;
  isUnlocked: boolean;
  bestScore?: number;
}

export interface CampaignProgress {
  currentLevel: number;
  completedLevels: number[];
  bestScores: Record<number, number>;
}

export interface CampaignState {
  levels: CampaignLevel[];
  progress: CampaignProgress;
}
