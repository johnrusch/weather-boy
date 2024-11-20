import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

interface PracticeModeSelectorProps {
  onModeSelect: (mode: 'campaign' | 'free') => void;
}

export function PracticeModeSelector({ onModeSelect }: PracticeModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <button
        onClick={() => onModeSelect('campaign')}
        className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      >
        <GraduationCap size={48} className="mb-4" />
        <h3 className="text-xl font-bold mb-2">Campaign Mode</h3>
        <p className="text-sm text-center opacity-90">
          Progress through structured levels with 5 prompts each
        </p>
        <p className="text-xs text-center mt-2 opacity-75">
          Fixed 2-minute response time
        </p>
      </button>

      <button
        onClick={() => onModeSelect('free')}
        className="flex flex-col items-center p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      >
        <BookOpen size={48} className="mb-4" />
        <h3 className="text-xl font-bold mb-2">Free Practice</h3>
        <p className="text-sm text-center opacity-90">
          Customize your practice session with your preferred settings
        </p>
      </button>
    </div>
  );
}