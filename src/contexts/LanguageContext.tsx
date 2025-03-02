import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import {
  getStoredLanguage,
  setStoredLanguage,
  isValidLanguage,
  changeLanguage,
  LANGUAGE_DISPLAY_NAMES,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../services/languageService";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  changeLanguage: (language: SupportedLanguage) => void;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "french",
  setLanguage: () => {},
  changeLanguage: () => {},
});

// Hook for components to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language selector component
export const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    if (isValidLanguage(newLanguage)) {
      changeLanguage(newLanguage);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="language-select"
        className="text-sm font-medium text-gray-600"
      >
        Language:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_DISPLAY_NAMES[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Use the centralized language service to initialize state
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return getStoredLanguage();
  });

  // Set language wrapper that validates input
  const setLanguage = (newLanguage: string) => {
    if (isValidLanguage(newLanguage)) {
      setLanguageState(newLanguage);
    } else {
      console.error("LanguageProvider: Invalid language:", newLanguage);
    }
  };

  // Handle language change with reloading
  const handleChangeLanguage = useMemo(() => {
    return (newLanguage: SupportedLanguage) => {
      changeLanguage(newLanguage);
    };
  }, []);

  // Keep context and localStorage in sync
  useEffect(() => {
    // 1. Storage event listener (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "preferredLanguage" &&
        event.newValue &&
        isValidLanguage(event.newValue)
      ) {
        if (event.newValue !== language) {
          setLanguageState(event.newValue);
        }
      }
    };

    // 2. Custom event listener for non-React components
    const handleLanguageChanged = (e: CustomEvent) => {
      const newLanguage = e.detail?.language;
      if (
        newLanguage &&
        newLanguage !== language &&
        isValidLanguage(newLanguage)
      ) {
        setLanguageState(newLanguage);
      }
    };

    // 3. Sync context with localStorage if they get out of sync
    const syncWithStorage = () => {
      const storedLanguage = getStoredLanguage(language);
      if (storedLanguage !== language) {
        setLanguageState(storedLanguage);
      }
    };

    // Initial sync
    syncWithStorage();

    // Set up event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "languageChanged",
      handleLanguageChanged as EventListener,
    );

    // Periodic check as backup (less frequent than before - every 5 seconds is enough)
    const intervalId = setInterval(syncWithStorage, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "languageChanged",
        handleLanguageChanged as EventListener,
      );
      clearInterval(intervalId);
    };
  }, [language]);

  // Update localStorage when context changes
  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  // Context value with memoization to prevent unnecessary renders
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      changeLanguage: handleChangeLanguage,
    }),
    [language, handleChangeLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
