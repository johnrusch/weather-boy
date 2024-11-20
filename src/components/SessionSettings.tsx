import React from "react";
import { Settings } from "lucide-react";
import { SessionSettings } from "../types/prompt";

interface SessionSettingsProps {
  settings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
}

export const SessionSettingsForm: React.FC<SessionSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Math.max(1, parseInt(value) || 1);
    onSettingsChange({
      ...settings,
      [name]: numValue,
    });
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="text-indigo-600" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">
          Session Settings
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="promptCount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Number of Prompts
          </label>
          <input
            type="number"
            id="promptCount"
            name="promptCount"
            min="1"
            max="10"
            value={settings.promptCount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Choose between 1-10 prompts
          </p>
        </div>
        <div>
          <label
            htmlFor="promptDuration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Response Time (minutes)
          </label>
          <input
            type="number"
            id="promptDuration"
            name="promptDuration"
            min="1"
            max="15"
            value={settings.promptDuration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Choose between 1-15 minutes
          </p>
        </div>
      </div>
    </div>
  );
};
