import React from 'react';
import { Download } from 'lucide-react';
import { Flashcard } from '../types/prompt';

interface FlashcardsListProps {
  flashcards: Flashcard[];
}

export const FlashcardsList: React.FC<FlashcardsListProps> = ({ flashcards }) => {
  const downloadCSV = () => {
    const csvContent = [
      'French,English',
      ...flashcards.map(card => `"${card.french}","${card.english}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'french_flashcards.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-gray-700">Generated Flashcards</h4>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg
                   hover:bg-green-700 transition-colors gap-1.5"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center gap-2 bg-green-50 p-3 rounded-lg"
          >
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium text-green-800">{card.french}</span>
              <span className="text-gray-400 hidden sm:inline">→</span>
              <span className="text-gray-600">{card.english}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};