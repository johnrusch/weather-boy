import React from "react";
import { Download } from "lucide-react";
import { Transcription } from "../types/prompt";

interface TranscriptionsListProps {
  transcriptions: Transcription[];
}

export const TranscriptionsList: React.FC<TranscriptionsListProps> = ({
  transcriptions,
}) => {
  const downloadTranscription = (
    transcription: Transcription,
    index: number,
  ) => {
    // Get the language name with capitalized first letter
    const language = transcription.prompt.language
      ? transcription.prompt.language.charAt(0).toUpperCase() +
        transcription.prompt.language.slice(1)
      : "Target Language";

    const content = `Prompt Category: ${transcription.prompt.category}
Prompt: ${transcription.prompt.text}
Language: ${language}
Timestamp: ${new Date(transcription.timestamp).toLocaleString()}

Transcription:
${transcription.text}

${
  transcription.evaluation
    ? `
Evaluation:
Score: ${transcription.evaluation.score}/10
${language} Usage: ${transcription.evaluation.percentageTargetLanguage}%
Prompt Relevance: ${transcription.evaluation.promptRelevance}
Feedback: ${transcription.evaluation.feedback}
`
    : ""
}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${index + 1}-${transcription.prompt.category.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Your Session Results</h3>
      {transcriptions.map((transcription, index) => {
        // Get the language name with capitalized first letter for display
        const language = transcription.prompt.language
          ? transcription.prompt.language.charAt(0).toUpperCase() +
            transcription.prompt.language.slice(1)
          : "Target Language";

        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
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
                  title="Download transcription"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {transcription.prompt.text}
            </p>
            <div className="bg-white p-3 rounded border text-gray-700">
              {transcription.text}
            </div>

            {transcription.evaluation && (
              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Response Evaluation
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Score: {transcription.evaluation.score}/10</p>
                  <p>
                    {language} Usage:{" "}
                    {transcription.evaluation.percentageTargetLanguage}%
                  </p>
                  <p>
                    Prompt Relevance: {transcription.evaluation.promptRelevance}
                  </p>
                  <p className="mt-2">{transcription.evaluation.feedback}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
