import React, { useState } from 'react';
import { Download, DownloadCloud } from 'lucide-react';
import { Transcription, Flashcard } from '../types/prompt';

interface TranscriptionsListProps {
  transcriptions: Transcription[];
}

// Add this helper function at the top of the file
const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-600';
};

// Add this new function for downloading selected flashcards
const downloadSelectedFlashcards = (flashcards: Flashcard[]) => {
  const csvContent = [
    'French,English', // CSV header
    ...flashcards.map(card => `"${card.french}","${card.english}"`)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected-flashcards.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const TranscriptionsList: React.FC<TranscriptionsListProps> = ({ transcriptions }) => {
  // Add state for selected flashcards
  const [selectedFlashcards, setSelectedFlashcards] = useState<Set<number>>(new Set());

  // Get unique flashcards (keeping the same logic)
  const uniqueFlashcards = transcriptions.reduce((cards: Flashcard[], trans) => {
    trans.flashcards.forEach(card => {
      if (!cards.some(existing => existing.french === card.french)) {
        cards.push(card);
      }
    });
    return cards;
  }, []);

  // Add toggle function for flashcard selection
  const toggleFlashcardSelection = (index: number) => {
    const newSelected = new Set(selectedFlashcards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFlashcards(newSelected);
  };

  const downloadTranscription = (transcription: Transcription, index: number) => {
    const flashcardsCSV = transcription.flashcards
      .map(card => `"${card.french}","${card.english}"`)
      .join('\n');
    
    const content = `Prompt Category: ${transcription.prompt.category}
Prompt: ${transcription.prompt.text}
Timestamp: ${new Date(transcription.timestamp).toLocaleString()}

Transcription:
${transcription.text}

${transcription.evaluation ? `
Evaluation:
Score: ${transcription.evaluation.score}/10
French Usage: ${transcription.evaluation.percentageFrench}%
Feedback: ${transcription.evaluation.feedback}

` : ''}
Flashcards (French,English):
${flashcardsCSV}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${index + 1}-${transcription.prompt.category.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllTranscriptions = () => {
    const content = transcriptions.map((t, i) => 
      `--- Transcription ${i + 1} ---
Prompt Category: ${t.prompt.category}
Prompt: ${t.prompt.text}
Timestamp: ${new Date(t.timestamp).toLocaleString()}

${t.text}

Flashcards (French,English):
${t.flashcards.map(card => `"${card.french}","${card.english}"`).join('\n')}

`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-transcriptions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Session Results</h3>
      </div>

      {/* Transcriptions Section */}
      <div className="space-y-4 mb-8">
        <h4 className="font-medium text-lg text-gray-700">Transcriptions</h4>
        {transcriptions.map((transcription, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                {transcription.prompt.category}: Prompt {index + 1}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {new Date(transcription.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={() => downloadTranscription(transcription, index)}
                  className="inline-flex items-center p-2 text-indigo-600 hover:text-indigo-700
                           transition-colors rounded-lg hover:bg-indigo-50"
                  title="Download transcription and flashcards"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{transcription.prompt.text}</p>
            <div className="bg-white p-3 rounded border text-gray-700">
              {transcription.text || "No transcription available"}
            </div>
            
            {/* Add Evaluation Section */}
            {transcription.evaluation && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-700">Response Evaluation</h5>
                  <span className={`font-bold ${getScoreColor(transcription.evaluation.score)}`}>
                    Score: {transcription.evaluation.score}/10
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">French Usage:</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${transcription.evaluation.percentageFrench}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium">{transcription.evaluation.percentageFrench}%</div>
                  </div>
                  <p className="text-sm text-gray-600">{transcription.evaluation.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flashcards Section */}
      {uniqueFlashcards.length > 0 && (
        <div className="mt-8 border-t pt-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-lg text-gray-700">
              Generated Flashcards ({uniqueFlashcards.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => downloadAllTranscriptions()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg
                         hover:bg-gray-700 transition-colors gap-2 text-sm"
              >
                <DownloadCloud size={18} />
                Download All Transcriptions
              </button>
              <button
                onClick={() => downloadSelectedFlashcards(
                  Array.from(selectedFlashcards).map(index => uniqueFlashcards[index])
                )}
                disabled={selectedFlashcards.size === 0}
                className={`inline-flex items-center px-4 py-2 rounded-lg
                         transition-colors gap-2 text-sm ${
                           selectedFlashcards.size > 0
                             ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                             : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                         }`}
              >
                <Download size={18} />
                Download Selected Flashcards ({selectedFlashcards.size})
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uniqueFlashcards.map((card, cardIndex) => (
              <div 
                key={cardIndex} 
                className={`bg-white p-4 rounded-lg border cursor-pointer
                           transition-all duration-200 ${
                             selectedFlashcards.has(cardIndex)
                               ? 'border-indigo-500 shadow-md bg-indigo-50'
                               : 'border-gray-200 hover:border-indigo-300'
                           }`}
                onClick={() => toggleFlashcardSelection(cardIndex)}
              >
                <div className="font-medium text-indigo-600 mb-1">{card.french}</div>
                <div className="text-gray-600">{card.english}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};