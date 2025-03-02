import type { Meta, StoryObj } from "@storybook/react";
import { PromptDisplay } from "../components/PromptDisplay";

/**
 * The PromptDisplay component shows the current prompt for the user to speak,
 * along with a timer and recording status.
 */
const meta: Meta<typeof PromptDisplay> = {
  title: "Components/PromptDisplay",
  component: PromptDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PromptDisplay>;

/**
 * Default display with a sample prompt
 */
export const Default: Story = {
  args: {
    prompt: {
      id: "1",
      text: "Bonjour, comment allez-vous aujourd'hui?",
      language: "french",
      difficulty: "beginner",
      duration: 30, // 30 seconds
      hint: "This is asking how you are doing today",
    },
    currentIndex: 0,
    totalPrompts: 5,
    timeLeft: 20, // 20 seconds left
    isRecording: false,
    onSkip: async () => console.log("Skipped prompt"),
  },
};

/**
 * Display with active recording
 */
export const Recording: Story = {
  args: {
    ...Default.args,
    isRecording: true,
  },
};

/**
 * Display with nearly expired timer
 */
export const TimerLow: Story = {
  args: {
    ...Default.args,
    timeLeft: 5, // only 5 seconds left
  },
};
