import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $authStore, $userStore } from '@clerk/astro/client';
import { Loader2, Search, Tag, Trash2, Globe } from 'lucide-react';
import type { Flashcard } from '../types/prompt';
import { useLanguage } from '../contexts/LanguageContext';

interface SavedFlashcard extends Flashcard {
  _id: string;
  savedAt: string;
  tags: string[];
  language?: string; // The language property might be present in newer cards
}

// Helper function to get display name for language code
const getLanguageDisplayName = (languageCode: string): string => {
  const languageMap: Record<string, string> = {
    'french': 'French',
    'spanish': 'Spanish'
  };
  return languageMap[languageCode] || languageCode.charAt(0).toUpperCase() + languageCode.slice(1);
};

export const SavedFlashcards: React.FC = () => {
  const auth = useStore($authStore);
  const user = useStore($userStore);
  const { language: currentLanguage } = useLanguage(); // Get current language from context
  
  console.log("SavedFlashcards: Current language from context:", currentLanguage);
  console.log("SavedFlashcards: localStorage value:", typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : null);
  
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  // Fetch cards when auth changes or language changes
  useEffect(() => {
    if (auth?.userId) {
      fetchFlashcards();
    }
  }, [auth?.userId, currentLanguage]);

  // Update available tags when language or showAllLanguages changes
  useEffect(() => {
    updateTagsForCurrentLanguage();
  }, [currentLanguage, showAllLanguages, flashcards]);

  const updateTagsForCurrentLanguage = () => {
    // Extract unique tags from flashcards matching the current language filter
    const relevantFlashcards = showAllLanguages
      ? flashcards
      : flashcards.filter(card => {
          const cardLanguage = determineCardLanguage(card);
          return cardLanguage === currentLanguage;
        });
    
    const uniqueTags = Array.from(
      new Set(relevantFlashcards.flatMap((card: SavedFlashcard) => card.tags || []))
    ).filter((tag): tag is string => typeof tag === 'string');
    
    setTags(uniqueTags);
  };

  // Helper function to consistently determine a card's language
  const determineCardLanguage = (card: SavedFlashcard): string => {
    if (card.language) return card.language;
    if (card.french) return 'french';
    if (card.targetLanguage) {
      const detected = detectLanguage(card.targetLanguage);
      return detected !== 'unknown' ? detected : currentLanguage;
    }
    return 'unknown';
  };

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-flashcards');
      
      // Check if the response is ok
      if (!response.ok) {
        console.warn(`Error fetching flashcards: ${response.status} ${response.statusText}`);
        useMockData();
        return;
      }
      
      const data = await response.json();
      
      // If data is empty or not an array, fall back to mock data
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('No flashcards returned from API, using mock data');
        useMockData();
        return;
      }
      
      // Process flashcards to ensure language is set
      const processedFlashcards = data.map((card: SavedFlashcard) => {
        // If language is not set, determine it from targetLanguage or french property
        if (!card.language) {
          card.language = determineCardLanguage(card);
        }
        return card;
      });
      
      setFlashcards(processedFlashcards);
      console.log("Fetched flashcards:", processedFlashcards);
      console.log("Current language:", currentLanguage);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Provide mock data when offline or experiencing backend issues
  const useMockData = () => {
    console.log("Using mock flashcards data");
    
    // Create some sample flashcards for both languages
    const mockFlashcards: SavedFlashcard[] = [
      {
        _id: 'mock-1',
        type: 'vocab',
        targetLanguage: 'perro',
        english: 'dog',
        language: 'spanish',
        savedAt: new Date().toISOString(),
        tags: ['animals', 'pets'],
        example: 'El perro está ladrando'
      },
      {
        _id: 'mock-2',
        type: 'vocab',
        targetLanguage: 'gato',
        english: 'cat',
        language: 'spanish',
        savedAt: new Date().toISOString(),
        tags: ['animals', 'pets'],
        example: 'El gato está durmiendo'
      },
      {
        _id: 'mock-3',
        type: 'phrase',
        targetLanguage: '¿Cómo estás?',
        english: 'How are you?',
        language: 'spanish',
        savedAt: new Date().toISOString(),
        tags: ['greetings'],
        example: '¡Hola! ¿Cómo estás?'
      },
      {
        _id: 'mock-4',
        type: 'vocab',
        french: 'chien',
        english: 'dog',
        language: 'french',
        savedAt: new Date().toISOString(),
        tags: ['animals', 'pets'],
        example: 'Le chien aboie'
      },
      {
        _id: 'mock-5',
        type: 'vocab',
        french: 'chat',
        english: 'cat',
        language: 'french',
        savedAt: new Date().toISOString(),
        tags: ['animals', 'pets'],
        example: 'Le chat dort'
      }
    ];
    
    setFlashcards(mockFlashcards);
  };

  // Try to detect language from text
  const detectLanguage = (text: string): string => {
    if (!text) return 'unknown';
    
    // Spanish-specific characters and patterns
    const spanishPatterns = ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡'];
    const hasSpanishPatterns = spanishPatterns.some(pattern => text.includes(pattern));
    
    // French-specific characters and patterns
    const frenchPatterns = ['ç', 'œ', 'à', 'è', 'ê', 'ô', 'û'];
    const hasFrenchPatterns = frenchPatterns.some(pattern => text.includes(pattern));
    
    if (hasSpanishPatterns && !hasFrenchPatterns) return 'spanish';
    if (hasFrenchPatterns && !hasSpanishPatterns) return 'french';
    
    return 'unknown';
  };

  const deleteFlashcard = async (id: string) => {
    try {
      const response = await fetch(`/api/saved-flashcards/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete flashcard');
      }
      
      setFlashcards(cards => cards.filter(card => card._id !== id));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  // Filter flashcards by search, tag, and language
  const filteredFlashcards = flashcards.filter(card => {
    const targetText = card.targetLanguage || card.french || '';
    const englishText = card.english || '';
    
    const matchesSearch = 
      targetText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      englishText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (card.tags && card.tags.includes(selectedTag));
    
    // Only show the currently selected language unless showAllLanguages is true
    const cardLanguage = determineCardLanguage(card);
    const matchesLanguage = showAllLanguages || cardLanguage === currentLanguage;
    
    return matchesSearch && matchesTag && matchesLanguage;
  });

  console.log("Filtered flashcards count:", filteredFlashcards.length);
  console.log("Current language in filter:", currentLanguage);

  // Group flashcards by language
  const groupedFlashcards = filteredFlashcards.reduce<Record<string, SavedFlashcard[]>>(
    (groups, card) => {
      const language = determineCardLanguage(card);
      if (!groups[language]) {
        groups[language] = [];
      }
      groups[language].push(card);
      return groups;
    },
    {}
  );

  // Sort languages alphabetically but keep Unknown at the end
  const sortedLanguages = Object.keys(groupedFlashcards).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return a.localeCompare(b);
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
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Language Toggle */}
          <div className="flex items-center mr-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAllLanguages}
                onChange={() => setShowAllLanguages(!showAllLanguages)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300">
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 flex items-center">
                <Globe size={16} className="mr-1" /> 
                {showAllLanguages ? "All Languages" : `${getLanguageDisplayName(currentLanguage)} Only`}
              </span>
            </label>
          </div>
          
          {/* Current Language Indicator */}
          <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm mr-3">
            Current App Language: {getLanguageDisplayName(currentLanguage)}
          </div>
          
          {/* Tag Filter */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 flex items-center mr-1">
                <Tag size={16} className="mr-1" /> Tags:
              </span>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                            ${selectedTag === tag
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } transition-colors`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredFlashcards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {showAllLanguages 
            ? "No flashcards found" 
            : `No flashcards found for ${getLanguageDisplayName(currentLanguage)}. Try switching to "All Languages" to see other flashcards.`}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedLanguages.map(language => (
            <div key={language} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center">
                <Globe size={20} className="inline-block mr-2 text-indigo-600" />
                {language === 'unknown' ? 'Other' : language.charAt(0).toUpperCase() + language.slice(1)}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({groupedFlashcards[language].length} flashcards)
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedFlashcards[language].map((card) => (
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
                    <div className="font-medium text-indigo-600 mb-1 mt-1">
                      {card.targetLanguage || card.french || ''}
                    </div>
                    <div className="text-gray-600 mb-2">{card.english || ''}</div>
                    {card.tags && card.tags.length > 0 && (
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