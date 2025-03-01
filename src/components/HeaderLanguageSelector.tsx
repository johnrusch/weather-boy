import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HeaderLanguageSelector() {
  // We'll keep the context for compatibility, but use a direct approach too
  const { language, setLanguage } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(language);
  
  useEffect(() => {
    // Try to get directly from localStorage as the source of truth
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      if (storedLanguage) {
        setCurrentLanguage(storedLanguage);
        // Also update the context for components that use it
        setLanguage(storedLanguage);
      }
    }
    
    console.log("HeaderLanguageSelector loaded with language:", currentLanguage);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    console.log("HeaderLanguageSelector: changing language to:", newLanguage);
    
    // Direct approach: save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLanguage);
    }
    
    // Update context
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    
    // Dispatch event for non-React components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage }
    }));
    
    // Force a page reload to ensure all components pick up the change
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="bg-gray-100 rounded-md flex items-center px-3 py-1">
      <label htmlFor="header-language-select" className="text-sm font-medium text-gray-600 mr-2">
        Language:
      </label>
      <select
        id="header-language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="bg-transparent border-none text-gray-700 py-1 focus:ring-0 focus:outline-none"
      >
        <option value="french">French</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
}
