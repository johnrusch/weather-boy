import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface CampaignFlashcard {
  _id: string;
  front: string;
  back: string;
  type: 'correction' | 'translation' | 'variation';
  context: string;
  mastered: boolean;
  reviewCount: number;
}

interface CampaignFlashcardReviewProps {
  levelId: number;
  onComplete: (canAttemptLevel: boolean) => void;
}

export const CampaignFlashcardReview: React.FC<CampaignFlashcardReviewProps> = ({
  levelId,
  onComplete,
}) => {
  const [flashcards, setFlashcards] = useState<CampaignFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [levelId]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`/api/campaign-flashcards?levelId=${levelId}`);
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      
      const data = await response.json();
      setFlashcards(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to load flashcards. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCardReview = async (mastered: boolean) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      const response = await fetch(`/api/campaign-flashcards?flashcardId=${currentCard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastered, reviewed: true }),
      });

      if (!response.ok) throw new Error('Failed to update flashcard');
      
      const { canAttemptLevel } = await response.json();
      
      // Update local state
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentIndex] = {
        ...currentCard,
        mastered,
        reviewCount: currentCard.reviewCount + 1,
      };
      setFlashcards(updatedFlashcards);

      // Move to next card or complete review
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setReviewComplete(true);
        onComplete(canAttemptLevel);
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
      setError('Failed to save progress. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center p-8">
        <Trophy className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-800">No flashcards to review!</p>
        <p className="text-gray-600">You're ready to attempt this level.</p>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="text-center p-8">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-800">Review Complete!</p>
        <p className="text-gray-600">Great job practicing your flashcards.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-6">
      <div className="relative">
        <div
          className={`bg-white p-6 rounded-xl shadow-lg transform transition-transform duration-500 cursor-pointer min-h-[200px] flex items-center justify-center ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">{currentCard.type}</p>
            <p className="text-lg font-medium">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            {isFlipped && (
              <p className="mt-4 text-sm text-gray-600 italic">
                Context: {currentCard.context}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </p>
        <div className="space-x-2">
          <button
            onClick={() => handleCardReview(false)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Need more practice"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleCardReview(true)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Got it!"
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};