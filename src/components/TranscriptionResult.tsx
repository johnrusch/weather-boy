/**
 * Transcription Result Component
 * Displays transcription results with evaluation and flashcards
 */

import React from "react";
import type { Transcription } from "../types/prompt";

interface TranscriptionResultProps {
  transcription: Transcription;
  index: number;
}

export function TranscriptionResult({
  transcription,
  index,
}: TranscriptionResultProps) {
  // Get evaluation data and score or provide defaults
  const { score = 0, feedback = "No feedback available" } =
    transcription.evaluation || {};

  // Format score as percentage with appropriate color
  const scoreColor =
    score >= 70
      ? "text-green-600"
      : score >= 50
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Response {index + 1}: "{transcription.prompt.text}"
      </h3>

      {/* Transcription */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-2">
          Your response:
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-800">
            {transcription.text || "No transcription available"}
          </p>
        </div>
      </div>

      {/* Evaluation */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-md font-medium text-gray-700">Evaluation:</h4>
          <span className={`text-lg font-bold ${scoreColor}`}>{score}%</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-800">{feedback}</p>
        </div>
      </div>

      {/* Flashcards */}
      {transcription.flashcards && transcription.flashcards.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Flashcards:
          </h4>
          <div className="space-y-3">
            {transcription.flashcards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-blue-800">{card.term}</span>
                  <span className="text-blue-600">→</span>
                  <span className="text-blue-800">{card.definition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscriptionResult;
