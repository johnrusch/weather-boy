import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, RotateCcw, Trophy, Download, Check } from 'lucide-react';

interface CampaignFlashcard {
  _id: string;
  front: string;
  back: string;
  type: 'correction' | 'translation' | 'variation';
  context: string;
  mastered: boolean;
  reviewCount: number;
  isSelected?: boolean;
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
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, [levelId]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`/api/campaign-flashcards?levelId=${levelId}`);
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      
      const data = await response.json();
      // Initialize all flashcards as selected
      const flashcardsWithSelection = data.map((card: CampaignFlashcard) => ({
        ...card,
        isSelected: true
      }));
      setFlashcards(flashcardsWithSelection);
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

  const toggleFlashcardSelection = (index: number) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[index] = {
      ...updatedFlashcards[index],
      isSelected: !updatedFlashcards[index].isSelected
    };
    setFlashcards(updatedFlashcards);
  };

  const handleDownloadCSV = () => {
    const selectedFlashcards = flashcards.filter(card => card.isSelected);
    
    if (selectedFlashcards.length === 0) {
      setDownloadMessage("No flashcards selected for download");
      setTimeout(() => setDownloadMessage(null), 3000);
      return;
    }
    
    let csvContent = "Front,Back,Type,Context\n";
    
    selectedFlashcards.forEach(card => {
      // Safely handle quotes in the text fields
      const front = card.front.replace(/"/g, '""');
      const back = card.back.replace(/"/g, '""');
      const context = card.context.replace(/"/g, '""');
      
      csvContent += `"${front}","${back}","${card.type}","${context}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Flashcards_Level${levelId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadMessage(`Successfully downloaded ${selectedFlashcards.length} flashcards`);
    setTimeout(() => setDownloadMessage(null), 3000);
  };

  const selectAllFlashcards = () => {
    setFlashcards(flashcards.map(card => ({
      ...card,
      isSelected: true
    })));
  };

  const deselectAllFlashcards = () => {
    setFlashcards(flashcards.map(card => ({
      ...card,
      isSelected: false
    })));
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
      <div className="p-8">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-800">Review Complete!</p>
          <p className="text-gray-600 mb-4">Great job practicing your flashcards.</p>
          <p className="text-gray-700">Select the flashcards you want to download and click the button below.</p>
        </div>

        {/* Download message notification */}
        {downloadMessage && (
          <div className={`p-3 mb-4 rounded-lg ${
            downloadMessage.startsWith('Successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {downloadMessage}
          </div>
        )}

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">Your Flashcards</h3>
          <div className="flex space-x-2">
            <button 
              onClick={selectAllFlashcards}
              className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
            >
              Select All
            </button>
            <button 
              onClick={deselectAllFlashcards}
              className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
            >
              Deselect All
            </button>
            <button 
              onClick={handleDownloadCSV}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-green-700"
            >
              <Download className="mr-1 h-4 w-4" />
              Download Selected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {flashcards.map((flashcard, index) => (
            <div 
              key={flashcard._id} 
              className={`border rounded-lg p-4 relative ${
                flashcard.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <button 
                onClick={() => toggleFlashcardSelection(index)}
                className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center ${
                  flashcard.isSelected 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {flashcard.isSelected ? <Check size={14} /> : '+'}
              </button>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 uppercase">{flashcard.type}</span>
                  <div className="mb-1">
                    <span className="font-medium text-indigo-800">{flashcard.front}</span>
                  </div>
                  <p className="text-gray-800">{flashcard.back}</p>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-xs text-gray-500">Context:</span>
                    <p className="text-gray-600 italic">{flashcard.context}</p>
                  </div>
                </div>
                
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  flashcard.mastered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {flashcard.mastered ? 'Mastered' : 'Needs Practice'}
                </span>
              </div>
            </div>
          ))}
        </div>
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
