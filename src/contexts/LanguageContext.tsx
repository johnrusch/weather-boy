import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the context value shape
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'french',
  setLanguage: () => {},
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize with stored preference or default to 'french'
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      return storedLanguage || 'french';
    }
    return 'french';
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Language changed to:', language);
      localStorage.setItem('preferredLanguage', language);
      
      // Dispatch a custom event so other components can react to language changes
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a client component to access the language
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="bg-gray-100 rounded-md flex items-center px-3 py-1">
      <label htmlFor="top-language-select" className="text-sm font-medium text-gray-600 mr-2">
        Language:
      </label>
      <select
        id="top-language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent border-none text-gray-700 py-1 focus:ring-0 focus:outline-none"
      >
        <option value="french">French</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
}
