import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HeaderLanguageSelector() {
  // Get language directly from context
  const { language, setLanguage } = useLanguage();
  
  // Set currentLanguage from context, not from local state
  useEffect(() => {
    console.log("HeaderLanguageSelector synced with language context:", language);
  }, [language]);
  
  // Verify that localStorage and context are in sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      if (storedLanguage && storedLanguage !== language) {
        console.log("HeaderLanguageSelector: detected mismatch between localStorage and context");
        console.log("- localStorage:", storedLanguage);
        console.log("- context:", language);
        // Force context to match localStorage
        setLanguage(storedLanguage);
      }
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    console.log("HeaderLanguageSelector: changing language to:", newLanguage);
    
    try {
      // 1. Update localStorage directly first
      localStorage.setItem('preferredLanguage', newLanguage);
      console.log("HeaderLanguageSelector: localStorage updated to", newLanguage);
      
      // 2. Then update the context
      setLanguage(newLanguage);
      console.log("HeaderLanguageSelector: context updated to", newLanguage);
      
      // 3. Dispatch event for any non-React components
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLanguage }
      }));
      console.log("HeaderLanguageSelector: languageChanged event dispatched");
      
      // 4. Force a page reload with a clear indication
      const reloadMessage = document.createElement('div');
      reloadMessage.style.position = 'fixed';
      reloadMessage.style.top = '0';
      reloadMessage.style.left = '0';
      reloadMessage.style.width = '100%';
      reloadMessage.style.padding = '10px';
      reloadMessage.style.backgroundColor = '#4F46E5';
      reloadMessage.style.color = 'white';
      reloadMessage.style.textAlign = 'center';
      reloadMessage.style.zIndex = '9999';
      reloadMessage.style.fontWeight = 'bold';
      reloadMessage.textContent = `Changing language to ${newLanguage}...`;
      document.body.appendChild(reloadMessage);
      
      console.log("HeaderLanguageSelector: reloading page in 500ms");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("HeaderLanguageSelector: Error changing language:", error);
      alert(`Error changing language: ${error}. Please try the debug page at /debug-language`);
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
        <option value="french">French</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
}
