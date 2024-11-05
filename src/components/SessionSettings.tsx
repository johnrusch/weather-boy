import React from 'react';
import { SessionSettings, LANGUAGE_CONFIGS, SupportedLanguage } from '../types/prompt';

interface SessionSettingsFormProps {
  settings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
}

export const SessionSettingsForm: React.FC<SessionSettingsFormProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleChange = (field: keyof SessionSettings, value: number | SupportedLanguage) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value as SupportedLanguage)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name} ({config.displayName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Number of Prompts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.promptCount}
            onChange={(e) => handleChange('promptCount', parseInt(e.target.value))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Minutes per Prompt
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.promptDuration}
            onChange={(e) => handleChange('promptDuration', parseInt(e.target.value))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};