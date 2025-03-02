import React, { createContext, useState, useEffect, useContext } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'french',
  setLanguage: () => {},
});

// Hook for components to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language selector component
export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    console.log("LanguageSelector: changing to", newLanguage);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLanguage);
    }
    
    // Update context
    setLanguage(newLanguage);
    
    // Force page reload to apply changes everywhere
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-600">
        Language:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="french">French</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      console.log("LanguageProvider: Initial localStorage value:", storedLanguage);
      // Check if storedLanguage exists and is a valid option (french or spanish)
      if (storedLanguage && ['french', 'spanish'].includes(storedLanguage)) {
        return storedLanguage;
      }
    }
    return 'french';
  });

  // Ensure we're always in sync with localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'preferredLanguage' && event.newValue) {
        console.log("LanguageProvider: Storage event detected:", event.newValue);
        if (event.newValue !== language) {
          console.log("LanguageProvider: Setting language to match storage:", event.newValue);
          setLanguage(event.newValue);
        }
      }
    };
    
    const checkLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem('preferredLanguage');
        if (storedLanguage && storedLanguage !== language && ['french', 'spanish'].includes(storedLanguage)) {
          console.log("LanguageProvider: localStorage value different from context:", {
            localStorage: storedLanguage,
            context: language
          });
          setLanguage(storedLanguage);
        }
      }
    };
    
    // Initial check
    checkLocalStorage();
    
    // Listen for storage events (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange);
    
    // Handle custom languageChanged events
    const handleLanguageChanged = (e: CustomEvent) => {
      const newLanguage = e.detail?.language;
      if (newLanguage && newLanguage !== language && ['french', 'spanish'].includes(newLanguage)) {
        console.log("LanguageProvider: languageChanged event detected:", newLanguage);
        setLanguage(newLanguage);
      }
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
    
    // Periodic check (backup in case other mechanisms fail)
    const intervalId = setInterval(checkLocalStorage, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
      clearInterval(intervalId);
    };
  }, [language]);

  // Update localStorage when language changes from the context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('LanguageProvider: Language changed to:', language);
      // Set localStorage with the current language value
      localStorage.setItem('preferredLanguage', language);
      
      // Force any components looking at localStorage directly to reload
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: language }
      }));
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
