/**
 * Language Service
 * Centralizes all language-related utilities and helper functions
 *
 * This service provides functions for language validation, storage, retrieval,
 * and display. It serves as the central point for language-related operations
 * throughout the application, ensuring consistency in language handling.
 */

// Supported languages
export const SUPPORTED_LANGUAGES = ["french", "spanish"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language display names mapping
export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  french: "French",
  spanish: "Spanish",
};

/**
 * Checks if a language string is a supported language
 *
 * @param {string} language - The language string to validate
 * @returns {boolean} Whether the language is supported
 * @example
 * isValidLanguage('french') // true
 * isValidLanguage('german') // false
 */
export function isValidLanguage(
  language: string,
): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Gets the current language from localStorage, with context fallback
 * Always ensures a valid language is returned
 *
 * @param {string} contextLanguage - Fallback language from context if localStorage is empty
 * @returns {SupportedLanguage} A valid supported language
 * @example
 * getStoredLanguage('spanish') // Returns the stored language or 'spanish' if none stored
 */
export function getStoredLanguage(
  contextLanguage: string = "french",
): SupportedLanguage {
  if (typeof window === "undefined") {
    // Server-side rendering fallback
    return isValidLanguage(contextLanguage) ? contextLanguage : "french";
  }

  // Try to get from localStorage
  const storedLanguage = localStorage.getItem("preferredLanguage");

  // Validate stored language
  if (storedLanguage && isValidLanguage(storedLanguage)) {
    return storedLanguage;
  }

  // Fallback to context if valid
  if (isValidLanguage(contextLanguage)) {
    return contextLanguage;
  }

  // Default fallback
  return "french";
}

/**
 * Sets the language in localStorage and dispatches appropriate events
 */
export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") {
    return; // Can't do anything server-side
  }

  console.log("languageService: Setting language to:", language);

  // Validate language first
  if (!isValidLanguage(language)) {
    console.error("languageService: Invalid language:", language);
    return;
  }

  try {
    // 1. Update localStorage
    localStorage.setItem("preferredLanguage", language);

    // 2. Dispatch event for non-React components
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language },
      }),
    );

    console.log("languageService: Language set successfully");
  } catch (error) {
    console.error("languageService: Error setting language:", error);
  }
}

/**
 * Gets the display name for a language code
 */
export function getLanguageDisplayName(languageCode: string): string {
  if (isValidLanguage(languageCode)) {
    return LANGUAGE_DISPLAY_NAMES[languageCode];
  }

  // Fallback: capitalize first letter
  return languageCode.charAt(0).toUpperCase() + languageCode.slice(1);
}

/**
 * Shows a visual indicator that the language is changing
 */
export function showLanguageChangeIndicator(language: string): void {
  if (typeof window === "undefined") {
    return;
  }

  // Create indicator element
  const indicator = document.createElement("div");
  indicator.style.position = "fixed";
  indicator.style.top = "0";
  indicator.style.left = "0";
  indicator.style.width = "100%";
  indicator.style.padding = "10px";
  indicator.style.backgroundColor = "#4F46E5";
  indicator.style.color = "white";
  indicator.style.textAlign = "center";
  indicator.style.zIndex = "9999";
  indicator.style.fontWeight = "bold";
  indicator.textContent = `Changing language to ${getLanguageDisplayName(language)}...`;

  // Add to document
  document.body.appendChild(indicator);
}

/**
 * Changes the application language with consistent behavior
 * Handles the entire language change process including UI feedback
 */
export function changeLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // 1. Validate language
    if (!isValidLanguage(language)) {
      throw new Error(`Invalid language: ${language}`);
    }

    // 2. Store in localStorage
    setStoredLanguage(language);

    // 3. Show visual indicator
    showLanguageChangeIndicator(language);

    // 4. Trigger page reload after a delay
    console.log("languageService: Reloading page in 500ms");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error("languageService: Error changing language:", error);
    alert(
      `Error changing language. Please try the debug page at /debug-language`,
    );
  }
}

/**
 * Provides a diagnostic utility for debugging language issues
 */
export function debugLanguage(): Record<string, any> {
  if (typeof window === "undefined") {
    return { error: "Cannot debug language on server" };
  }

  const storedLanguage = localStorage.getItem("preferredLanguage");
  const selectors = document.querySelectorAll(
    "select#language-selector, select#header-language-select",
  );
  const selectorValues: Record<string, string> = {};

  selectors.forEach((selector) => {
    selectorValues[(selector as HTMLElement).id] = (
      selector as HTMLSelectElement
    ).value;
  });

  const report = {
    localStorage: storedLanguage,
    selectors: selectorValues,
    timestamp: new Date().toISOString(),
  };

  console.log("=== LANGUAGE SYSTEM DEBUG ===");
  console.table(report);
  console.log("============================");

  return report;
}
