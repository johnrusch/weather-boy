/**
 * Processing Indicator Component
 * Shows the current processing stage with animations
 */

import React from "react";
import type { ProcessingStage } from "../hooks/useLanguageSession";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  stage: ProcessingStage;
}

export function ProcessingIndicator({
  isProcessing,
  stage,
}: ProcessingIndicatorProps) {
  if (!isProcessing) {
    return null;
  }

  // Define stage-specific messages and colors
  const stageConfig = {
    idle: {
      message: "Preparing...",
      color: "blue",
    },
    transcribing: {
      message: "Transcribing your speech...",
      color: "blue",
    },
    evaluating: {
      message: "Evaluating your response...",
      color: "yellow",
    },
    generating: {
      message: "Generating flashcards and feedback...",
      color: "green",
    },
  };

  const { message, color } = stageConfig[stage];
  const bgColor = `bg-${color}-500`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-white shadow-md">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 ${bgColor} rounded-full animate-pulse`}></div>
        <div
          className={`w-3 h-3 ${bgColor} rounded-full animate-pulse delay-150`}
        ></div>
        <div
          className={`w-3 h-3 ${bgColor} rounded-full animate-pulse delay-300`}
        ></div>
        <span className="text-lg font-medium text-gray-700 ml-2">
          {message}
        </span>
      </div>
    </div>
  );
}

export default ProcessingIndicator;
