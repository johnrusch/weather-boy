import React from 'react';
import { Download, DownloadCloud } from 'lucide-react';
import { Transcription } from '../types/prompt';

interface TranscriptionsListProps {
  transcriptions: Transcription[];
}

export const TranscriptionsList: React.FC<TranscriptionsListProps> = ({ transcriptions }) => {
  const downloadTranscription = (transcription: Transcription, index: number) => {
    const flashcardsCSV = transcription.flashcards
      .map(card => `"${card.french}","${card.english}"`)
      .join('\n');
    
    const content = `Prompt Category: ${transcription.prompt.category}
Prompt: ${transcription.prompt.text}
Timestamp: ${new Date(transcription.timestamp).toLocaleString()}

Transcription:
${transcription.text}

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
        <h3 className="text-xl font-semibold">Your Transcriptions & Flashcards</h3>
        <button
          onClick={downloadAllTranscriptions}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 transition-colors gap-2 text-sm"
        >
          <DownloadCloud size={18} />
          Download All
        </button>
      </div>
      <div className="space-y-4">
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
            
            {transcription.flashcards.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Generated Flashcards:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {transcription.flashcards.map((card, cardIndex) => (
                    <div key={cardIndex} className="bg-white p-2 rounded border text-sm">
                      <div className="font-medium text-indigo-600">{card.french}</div>
                      <div className="text-gray-600">{card.english}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};