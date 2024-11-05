import React from 'react';
import { Download, DownloadCloud } from 'lucide-react';
import JSZip from 'jszip';
import { Prompt } from '../types/prompt';

interface RecordingsListProps {
  recordings: Blob[];
  prompts: Prompt[];
}

export const RecordingsList: React.FC<RecordingsListProps> = ({ recordings, prompts }) => {
  const downloadRecording = (recording: Blob, index: number) => {
    const url = URL.createObjectURL(recording);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${index + 1}-${prompts[index].category.toLowerCase()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllRecordings = async () => {
    const zip = new JSZip();
    
    // Add each recording to the zip file
    recordings.forEach((recording, index) => {
      const fileName = `recording-${index + 1}-${prompts[index].category.toLowerCase()}.webm`;
      zip.file(fileName, recording);
      
      // Add a text file with the prompt
      const promptText = `Category: ${prompts[index].category}\nPrompt: ${prompts[index].text}`;
      zip.file(`prompt-${index + 1}.txt`, promptText);
    });
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download the zip file
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recordings.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Recordings</h3>
        <button
          onClick={downloadAllRecordings}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 transition-colors gap-2 text-sm"
        >
          <DownloadCloud size={18} />
          Download All
        </button>
      </div>
      <div className="space-y-4">
        {recordings.map((recording, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                {prompts[index].category}: Prompt {index + 1}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {Math.round(prompts[index].duration / 60)} minutes
                </span>
                <button
                  onClick={() => downloadRecording(recording, index)}
                  className="inline-flex items-center p-2 text-indigo-600 hover:text-indigo-700
                           transition-colors rounded-lg hover:bg-indigo-50"
                  title="Download recording"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{prompts[index].text}</p>
            <audio controls src={URL.createObjectURL(recording)} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};