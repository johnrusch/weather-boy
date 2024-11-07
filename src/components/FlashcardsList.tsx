import React, { useState } from 'react';
import { Download, BookmarkPlus, Check, Loader2, X } from 'lucide-react';
import { Flashcard } from '../types/prompt';
import { useStore } from '@nanostores/react';
import { $authStore, $userStore } from '@clerk/astro/client';

interface FlashcardsListProps {
  flashcards: Flashcard[];
}

export const FlashcardsList: React.FC<FlashcardsListProps> = ({ flashcards: initialFlashcards }) => {
  const auth = useStore($authStore);
  const user = useStore($userStore);
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveFlashcards = async (cardsToSave: Flashcard[]) => {
    if (!auth?.userId) return;
    
    setSavingStatus('saving');
    try {
      const response = await fetch('/api/saved-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flashcards: cardsToSave,
          tags: ['session']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.details || 'Failed to save flashcards');
      }
      
      const data = await response.json();
      setSavingStatus('success');
      
      const savedCardIndices = cardsToSave.map(card => 
        flashcards.findIndex(f => 
          f.french === card.french && 
          f.english === card.english && 
          f.type === card.type
        )
      );

      setFlashcards(current => 
        current.filter((_, index) => !savedCardIndices.includes(index))
      );
      setSelectedCards(new Set());

      if (data.summary.duplicates > 0) {
        if (data.summary.newCards > 0) {
          showToast(
            `Saved ${data.summary.newCards} new flashcard${data.summary.newCards === 1 ? '' : 's'}, ` +
            `${data.summary.duplicates} already existed`,
            'success'
          );
        } else {
          showToast(`All ${data.summary.duplicates} flashcards already saved`, 'error');
        }
      } else {
        showToast(
          `Successfully saved ${data.summary.newCards} flashcard${data.summary.newCards === 1 ? '' : 's'}`,
          'success'
        );
      }

      setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setSavingStatus('error');
      showToast('Failed to save flashcards', 'error');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }
  };

  const toggleCardSelection = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const downloadCSV = () => {
    const csvContent = [
      'French,English',
      ...flashcards.map(card => `"${card.french}","${card.english}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'french_flashcards.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-4 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all transform translate-y-0
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.type === 'success' ? (
            <Check size={20} />
          ) : (
            <X size={20} />
          )}
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-gray-700">Generated Flashcards</h4>
        <div className="flex gap-2">
          {!auth?.userId && <span className="text-sm text-red-500">No user found</span>}
          {auth?.userId && (
            <>
              <button
                onClick={() => saveFlashcards(flashcards)}
                disabled={savingStatus === 'saving'}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg
                         hover:bg-indigo-700 transition-colors gap-1.5 disabled:opacity-50"
              >
                {savingStatus === 'saving' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : savingStatus === 'success' ? (
                  <Check size={16} />
                ) : (
                  <BookmarkPlus size={16} />
                )}
                Save All
              </button>
              {selectedCards.size > 0 && (
                <button
                  onClick={() => saveFlashcards(
                    Array.from(selectedCards).map(index => flashcards[index])
                  )}
                  disabled={savingStatus === 'saving'}
                  className="inline-flex items-center px-3 py-1.5 text-sm border border-indigo-600 
                           text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors gap-1.5
                           disabled:opacity-50"
                >
                  <BookmarkPlus size={16} />
                  Save Selected ({selectedCards.size})
                </button>
              )}
            </>
          )}
          <button
            onClick={downloadCSV}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg
                     hover:bg-green-700 transition-colors gap-1.5"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>
      {flashcards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          All flashcards have been saved!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {flashcards.map((card, index) => (
            <div
              key={index}
              onClick={() => toggleCardSelection(index)}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg cursor-pointer
                         transition-colors ${
                           selectedCards.has(index)
                             ? 'bg-indigo-50 border-2 border-indigo-500'
                             : 'bg-green-50 border border-green-100 hover:border-green-200'
                         }`}
            >
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium text-green-800">{card.french}</span>
                <span className="text-gray-400 hidden sm:inline">→</span>
                <span className="text-gray-600">{card.english}</span>
              </div>
              {card.type && (
                <span className={`text-xs px-2 py-1 rounded ${
                  card.type === 'correction' ? 'bg-amber-100 text-amber-800' :
                  card.type === 'translation' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {card.type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};