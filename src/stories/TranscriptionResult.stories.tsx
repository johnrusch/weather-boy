import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { TranscriptionResult } from "../components/TranscriptionResult";

/**
 * The TranscriptionResult component displays the results of a speech transcription,
 * including the original text, evaluation score, and feedback.
 * 
 * It supports:
 * - Color-coded scoring
 * - Detailed feedback display
 * - Flashcard generation
 */
const meta: Meta<typeof TranscriptionResult> = {
  title: "Components/TranscriptionResult",
  component: TranscriptionResult,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TranscriptionResult>;

// Good score example
export const GoodScore: Story = {
  args: {
    transcription: {
      text: "Bonjour, comment allez-vous aujourd'hui?",
      prompt: {
        text: "Bonjour, comment allez-vous aujourd'hui?",
        duration: 30,
        category: "greetings",
        language: "french",
      },
      timestamp: new Date().toISOString(),
      evaluation: {
        score: 85,
        feedback: "Excellent pronunciation. Good intonation on the question.",
        corrections: [],
      },
      flashcards: [
        { targetLanguage: "bonjour", english: "hello", type: "translation" },
        { targetLanguage: "comment allez-vous", english: "how are you", type: "translation" },
      ],
    },
    index: 0,
  },
};

// Poor score example
export const PoorScore: Story = {
  args: {
    transcription: {
      text: "Bonjer, commont alley voo",
      prompt: {
        text: "Bonjour, comment allez-vous aujourd'hui?",
        duration: 30,
        category: "greetings",
        language: "french",
      },
      timestamp: new Date().toISOString(),
      evaluation: {
        score: 45,
        feedback: "Work on your pronunciation of 'Bonjour' and 'allez-vous'.",
        corrections: [
          { incorrect: "Bonjer", correct: "Bonjour" },
          { incorrect: "commont alley voo", correct: "comment allez-vous" },
        ],
      },
      flashcards: [
        { targetLanguage: "bonjour", english: "hello", type: "translation" },
        { targetLanguage: "comment allez-vous", english: "how are you", type: "translation" },
      ],
    },
    index: 0,
  },
};
