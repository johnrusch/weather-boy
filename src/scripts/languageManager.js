/**
 * Enhanced Language Management Script
 * 
 * This script handles language selection in vanilla JS outside of React components.
 * It maintains synchronization between localStorage, DOM selectors, and custom events.
 */
 
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('languageManager: Script initialized');
  initializeLanguageSelectors();
  
  // Listen for language changes from React components
  window.addEventListener('languageChanged', function(event) {
    const newLanguage = event.detail?.language;
    if (!newLanguage) return;
    
    console.log('languageManager: Received languageChanged event:', newLanguage);
    updateAllLanguageSelectors(newLanguage);
  });
  
  // Set up a MutationObserver to catch dynamically added language selectors
  setupMutationObserver();
  
  // Add diagnostic function to window
  window.debugLanguage = debugLanguage;
  
  // Run initial validation
  validateLanguageState();
  
  // Run periodic validation to ensure consistency
  setInterval(validateLanguageState, 5000);
});

/**
 * Initialize all language selectors in the document
 */
function initializeLanguageSelectors() {
  // Find all language selectors
  const selectors = document.querySelectorAll('select#language-selector, select#header-language-select');
  if (selectors.length === 0) {
    console.log('languageManager: No language selectors found in the document');
    return;
  }
  
  // Get the saved language
  const savedLanguage = getStoredLanguage();
  console.log('languageManager: Using stored language:', savedLanguage);
  
  // Initialize each selector
  selectors.forEach(selector => {
    // Set initial value
    selector.value = savedLanguage;
    
    // Remove any existing listeners to prevent duplicates
    selector.removeEventListener('change', handleLanguageChange);
    
    // Add change listener
    selector.addEventListener('change', handleLanguageChange);
    
    console.log(`languageManager: Initialized selector #${selector.id} with value:`, savedLanguage);
  });
}

/**
 * Update all language selectors in the document to match the specified language
 */
function updateAllLanguageSelectors(language) {
  if (!isValidLanguage(language)) {
    console.error('languageManager: Invalid language provided:', language);
    return;
  }
  
  // Update all language selectors in the document
  const selectors = document.querySelectorAll('select#language-selector, select#header-language-select');
  let updated = false;
  
  selectors.forEach(selector => {
    if (selector.value !== language) {
      console.log(`languageManager: Updating selector #${selector.id} to:`, language);
      selector.value = language;
      updated = true;
    }
  });
  
  if (selectors.length > 0 && !updated) {
    console.log('languageManager: Selectors already have correct value:', language);
  } else if (selectors.length === 0) {
    console.log('languageManager: No selectors found to update');
  }
}

/**
 * Handle language change events from selectors
 */
function handleLanguageChange(event) {
  const newLanguage = event.target.value;
  const oldLanguage = getStoredLanguage();
  
  console.log('languageManager: Language change detected from:', oldLanguage, 'to:', newLanguage);
  
  // Validate it's one of our supported languages
  if (!isValidLanguage(newLanguage)) {
    console.error('languageManager: Invalid language selected:', newLanguage);
    event.target.value = oldLanguage; // Reset to previous value
    return;
  }
  
  try {
    // 1. Save to localStorage
    localStorage.setItem('preferredLanguage', newLanguage);
    console.log('languageManager: Updated localStorage with:', newLanguage);
    
    // 2. Dispatch event for React components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage }
    }));
    console.log('languageManager: Dispatched languageChanged event');
    
    // 3. Show visual feedback that language is changing
    showLanguageChangeIndicator(newLanguage);
    
    // 4. Force reload the page after a short delay
    console.log('languageManager: Page will reload in 500ms');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('languageManager: Error changing language:', error);
    event.target.value = oldLanguage; // Reset to previous value
  }
}

/**
 * Get the current language from localStorage, with a fallback to 'french'
 */
function getStoredLanguage() {
  const language = localStorage.getItem('preferredLanguage');
  return isValidLanguage(language) ? language : 'french';
}

/**
 * Check if a language value is valid
 */
function isValidLanguage(language) {
  return language && ['french', 'spanish'].includes(language);
}

/**
 * Show a visual indicator that the language is changing
 */
function showLanguageChangeIndicator(language) {
  const indicator = document.createElement('div');
  indicator.style.position = 'fixed';
  indicator.style.top = '0';
  indicator.style.left = '0';
  indicator.style.width = '100%';
  indicator.style.padding = '10px';
  indicator.style.backgroundColor = '#4F46E5';
  indicator.style.color = 'white';
  indicator.style.textAlign = 'center';
  indicator.style.zIndex = '9999';
  indicator.style.fontWeight = 'bold';
  indicator.textContent = `Changing language to ${language}...`;
  
  document.body.appendChild(indicator);
}

/**
 * Set up a MutationObserver to initialize language selectors when they're added to the DOM
 */
function setupMutationObserver() {
  // Create an observer instance
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Check if language selectors were added
        const addedSelectors = [];
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if ((node.id === 'language-selector' || node.id === 'header-language-select') && node.tagName === 'SELECT') {
              addedSelectors.push(node);
            } else {
              // Check for selectors inside the added node
              const childSelectors = node.querySelectorAll('select#language-selector, select#header-language-select');
              if (childSelectors.length > 0) {
                childSelectors.forEach(selector => addedSelectors.push(selector));
              }
            }
          }
        });
        
        // Initialize any language selectors that were added
        if (addedSelectors.length > 0) {
          console.log('languageManager: New language selectors detected:', addedSelectors.length);
          initializeLanguageSelectors();
        }
      }
    });
  });
  
  // Start observing the document body for DOM changes
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('languageManager: MutationObserver set up for language selectors');
}

/**
 * Validate the current language state and fix any inconsistencies
 */
function validateLanguageState() {
  const storedLanguage = getStoredLanguage();
  const selectors = document.querySelectorAll('select#language-selector, select#header-language-select');
  let mismatchFound = false;
  
  selectors.forEach(selector => {
    if (selector.value !== storedLanguage) {
      console.warn(`languageManager: Selector #${selector.id} has mismatched value:`, {
        selector: selector.value,
        localStorage: storedLanguage
      });
      selector.value = storedLanguage;
      mismatchFound = true;
    }
  });
  
  if (mismatchFound) {
    console.log('languageManager: Fixed language state inconsistencies');
  }
  
  return !mismatchFound;
}

/**
 * Debug function that can be called from the browser console
 */
function debugLanguage() {
  const storedLanguage = localStorage.getItem('preferredLanguage');
  const selectors = document.querySelectorAll('select#language-selector, select#header-language-select');
  const selectorValues = {};
  
  selectors.forEach(selector => {
    selectorValues[selector.id] = selector.value;
  });
  
  const report = {
    localStorage: storedLanguage,
    selectors: selectorValues,
    timestamp: new Date().toISOString(),
    isValid: validateLanguageState()
  };
  
  console.log('=== LANGUAGE SYSTEM DEBUG ===');
  console.table(report);
  console.log('============================');
  
  return report;
}
