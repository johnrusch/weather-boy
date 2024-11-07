import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $authStore, $userStore } from '@clerk/astro/client';
import { Loader2, Search, Tag, Trash2 } from 'lucide-react';
import type { Flashcard } from '../types/prompt';

interface SavedFlashcard extends Flashcard {
  _id: string;
  savedAt: string;
  tags: string[];
}

export const SavedFlashcards: React.FC = () => {
  const auth = useStore($authStore);
  const user = useStore($userStore);
  
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (auth?.userId) {
      fetchFlashcards();
    }
  }, [auth?.userId]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/saved-flashcards');
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      const data = await response.json();
      setFlashcards(data);
      
      // Extract unique tags
      const uniqueTags = Array.from(
        new Set(data.flatMap((card: SavedFlashcard) => card.tags))
      );
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    try {
      console.log('Attempting to delete flashcard:', id);
      
      const response = await fetch(`/api/saved-flashcards/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete flashcard');
      }
      
      setFlashcards(cards => cards.filter(card => card._id !== id));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = 
      card.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.english.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || card.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                       ${selectedTag === tag
                         ? 'bg-indigo-600 text-white'
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       } transition-colors gap-1`}
            >
              <Tag size={14} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredFlashcards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No flashcards found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((card) => (
            <div
              key={card._id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md
                       transition-shadow relative group"
            >
              <button
                onClick={() => deleteFlashcard(card._id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500
                         opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete flashcard"
              >
                <Trash2 size={16} />
              </button>
              <div className={getTypeColor(card.type)}>{card.type}</div>
              <div className="font-medium text-indigo-600 mb-1 mt-1">{card.french}</div>
              <div className="text-gray-600 mb-2">{card.english}</div>
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'correction':
      return 'text-amber-600 text-xs uppercase tracking-wide';
    case 'translation':
      return 'text-blue-600 text-xs uppercase tracking-wide';
    case 'variation':
      return 'text-green-600 text-xs uppercase tracking-wide';
    default:
      return 'text-gray-600 text-xs uppercase tracking-wide';
  }
}; 