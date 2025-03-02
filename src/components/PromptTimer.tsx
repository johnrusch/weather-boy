/**
 * Prompt Timer Component
 * Displays a timer for the current prompt
 */

import React from "react";
import { calculateTimerProgress } from "../services/promptService";

interface PromptTimerProps {
  timeLeft: number;
  totalDuration: number;
  className?: string;
}

export function PromptTimer({
  timeLeft,
  totalDuration,
  className = "",
}: PromptTimerProps) {
  // Calculate progress for the timer
  const progress = calculateTimerProgress(timeLeft, totalDuration);

  // Format the time remaining
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-2xl font-bold mb-2">{formattedTime}</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default PromptTimer;
