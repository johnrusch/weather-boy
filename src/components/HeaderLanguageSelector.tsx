import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES } from '../services/languageService';

/**
 * Header Language Selector Component
 * A simplified language selector component for the header that uses the language context
 */
export default function HeaderLanguageSelector() {
  // Get language and changeLanguage function from context
  const { language, changeLanguage } = useLanguage();
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    // Use the centralized language change function from context
    // This handles localStorage, events, and page reload
    if (SUPPORTED_LANGUAGES.includes(newLanguage as any)) {
      changeLanguage(newLanguage as any);
    }
  };

  return (
    <div className="bg-gray-100 rounded-md flex items-center px-3 py-1">
      <label htmlFor="header-language-select" className="text-sm font-medium text-gray-600 mr-2">
        Language:
      </label>
      <select
        id="header-language-select"
        value={language}
        onChange={handleLanguageChange}
        className="bg-transparent border-none text-gray-700 py-1 focus:ring-0 focus:outline-none"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>{LANGUAGE_DISPLAY_NAMES[lang]}</option>
        ))}
      </select>
    </div>
  );
}
