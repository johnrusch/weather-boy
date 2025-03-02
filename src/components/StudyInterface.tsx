import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $authStore } from "@clerk/astro/client";
import {
  Loader2,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Calendar,
} from "lucide-react";

interface StudyFlashcard {
  _id: string;
  targetLanguage: string;
  english: string;
  type: string;
  originalText?: string;
  promptId: string;
  confidence: "again" | "hard" | "good" | "easy";
  interval: number;
  easeFactor: number;
  reviewCount: number;
  nextReviewDate: string;
  prompt?: {
    text: string;
    category: string;
  };
}

interface StudyStats {
  todayCount: number;
  streakDays: number;
  totalReviewed: number;
  masteredCount: number;
}

export const StudyInterface: React.FC = () => {
  const auth = useStore($authStore);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState<StudyFlashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [remainingCards, setRemainingCards] = useState<number>(0);
  const [stats, setStats] = useState<StudyStats>({
    todayCount: 0,
    streakDays: 0,
    totalReviewed: 0,
    masteredCount: 0,
  });

  useEffect(() => {
    if (auth?.userId) {
      fetchNextCard();
      fetchStudyStats();
    }
  }, [auth?.userId]);

  const fetchStudyStats = async () => {
    try {
      const response = await fetch("/api/study/stats");
      if (!response.ok) throw new Error("Failed to fetch study stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching study stats:", error);
    }
  };

  const fetchNextCard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/study/next-card");
      if (!response.ok) throw new Error("Failed to fetch next card");
      const data = await response.json();
      setCurrentCard(data.card);
      setRemainingCards(data.remainingCount);
      setShowAnswer(false);
    } catch (error) {
      console.error("Error fetching next card:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (
    response: "again" | "hard" | "good" | "easy",
  ) => {
    if (!currentCard) return;

    try {
      await fetch(`/api/study/record-response/${currentCard._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });

      // Update stats immediately for better UX
      setStats((prev) => ({
        ...prev,
        todayCount: prev.todayCount + 1,
        totalReviewed: prev.totalReviewed + 1,
      }));

      fetchNextCard();
    } catch (error) {
      console.error("Error recording response:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Study Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Calendar size={20} />
            <h3 className="font-medium">Today</h3>
          </div>
          <p className="text-2xl font-bold">{stats.todayCount}</p>
          <p className="text-sm text-gray-500">cards reviewed</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ThumbsUp size={20} />
            <h3 className="font-medium">Streak</h3>
          </div>
          <p className="text-2xl font-bold">{stats.streakDays}</p>
          <p className="text-sm text-gray-500">days</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <BookOpen size={20} />
            <h3 className="font-medium">Total</h3>
          </div>
          <p className="text-2xl font-bold">{stats.totalReviewed}</p>
          <p className="text-sm text-gray-500">reviews</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <ThumbsUp size={20} />
            <h3 className="font-medium">Mastered</h3>
          </div>
          <p className="text-2xl font-bold">{stats.masteredCount}</p>
          <p className="text-sm text-gray-500">cards</p>
        </div>
      </div>

      {/* Current Card */}
      {!currentCard ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            No cards to review right now!
          </h3>
          <p className="text-gray-600 mb-6">
            Come back later when your cards are due for review.
          </p>
          <button
            onClick={fetchNextCard}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors gap-2"
          >
            <RotateCw size={20} />
            Check Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Card Context */}
          {currentCard.prompt && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Original Context:</p>
              <p className="text-gray-700">{currentCard.prompt.text}</p>
              <p className="text-sm text-gray-500 mt-2">
                Category: {currentCard.prompt.category}
              </p>
            </div>
          )}

          {/* Card Content - Now showing English first */}
          <div className="mb-8 text-center">
            <div className="text-2xl font-medium mb-4">
              {showAnswer ? currentCard.targetLanguage : currentCard.english}
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                         hover:bg-indigo-700 transition-colors"
              >
                Show Target Language Translation
              </button>
            ) : (
              <div className="space-y-4">
                <div className="text-2xl font-medium mb-6 text-indigo-600">
                  {currentCard.english}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleResponse("again")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg
                             hover:bg-red-700 transition-colors"
                    title="Review again soon"
                  >
                    Didn't Know
                  </button>
                  <button
                    onClick={() => handleResponse("hard")}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg
                             hover:bg-yellow-700 transition-colors"
                    title="Was difficult to recall"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleResponse("good")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg
                             hover:bg-green-700 transition-colors"
                    title="Remembered with some effort"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleResponse("easy")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg
                             hover:bg-blue-700 transition-colors"
                    title="Remembered easily"
                  >
                    Easy
                  </button>
                </div>

                {/* Added hint about card type */}
                <div className="mt-4 text-sm text-gray-500">
                  Card Type:{" "}
                  {currentCard.type.charAt(0).toUpperCase() +
                    currentCard.type.slice(1)}
                </div>
              </div>
            )}
          </div>

          {/* Review Info */}
          <div className="text-sm text-gray-500 text-center">
            Cards remaining today: {remainingCards}
          </div>
        </div>
      )}
    </div>
  );
};
