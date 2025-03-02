import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { MainMenu } from "../components/MainMenu";
import { LanguageProvider } from "../contexts/LanguageContext";

/**
 * The MainMenu component displays the main navigation interface for the language learning application.
 * It allows users to choose between Campaign Mode and Free Practice Mode.
 */
const meta: Meta<typeof MainMenu> = {
  title: "Components/MainMenu",
  component: MainMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <LanguageProvider>
        <Story />
      </LanguageProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MainMenu>;

/**
 * Default state of the MainMenu component.
 */
export const Default: Story = {
  args: {
    onSelectMode: (mode) => {
      console.log(`Selected mode: ${mode}`);
    },
  },
};
