/**
 * Main Menu Component
 * Displays the main menu of the language learning application
 */

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGE_DISPLAY_NAMES } from "../services/languageService";

interface MainMenuProps {
  onSelectMode: (mode: "campaign" | "practice") => void;
}

export function MainMenu({ onSelectMode }: MainMenuProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-3xl font-bold mb-2">Language Learning</h1>
      <p className="text-xl text-gray-600 mb-8">
        Currently studying {LANGUAGE_DISPLAY_NAMES[language]}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Campaign Mode Card */}
        <div
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectMode("campaign")}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Campaign Mode</h2>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Structured
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            Progress through a series of levels with increasingly difficult
            challenges. Track your improvements and unlock new content as you
            advance.
          </p>

          <div className="mt-auto pt-4 flex justify-end">
            <button
              className="text-blue-500 font-medium hover:text-blue-700"
              onClick={() => onSelectMode("campaign")}
            >
              Start Campaign →
            </button>
          </div>
        </div>

        {/* Free Practice Card */}
        <div
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelectMode("practice")}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Free Practice</h2>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Flexible
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            Practice your speaking skills with random prompts. Customize the
            session length and receive personalized feedback on your responses.
          </p>

          <div className="mt-auto pt-4 flex justify-end">
            <button
              className="text-green-500 font-medium hover:text-green-700"
              onClick={() => onSelectMode("practice")}
            >
              Start Practice →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Choose a mode to begin your language learning journey.</p>
        <p>
          You can change languages at any time using the selector in the header.
        </p>
      </div>
    </div>
  );
}

export default MainMenu;
