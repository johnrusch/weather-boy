import React from "react";
import { Prompt } from "../types/prompt";

interface PromptCardProps {
  prompt: Prompt;
  currentIndex: number;
  totalPrompts: number;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  currentIndex,
  totalPrompts,
}) => {
  return (
    <div className="bg-indigo-50 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Prompt {currentIndex + 1} of {totalPrompts}
        </h2>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {prompt.category}
        </span>
      </div>
      <p className="text-gray-700 text-lg leading-relaxed">{prompt.text}</p>
    </div>
  );
};
