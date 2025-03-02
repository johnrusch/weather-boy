// Utility script to reset language settings
// Can be run from the browser console to fix language issues

function resetLanguageSettings() {
  console.log('Language reset utility: Starting reset process');
  
  // Step 1: Clear localStorage entry
  const oldValue = localStorage.getItem('preferredLanguage');
  console.log('Language reset utility: Current localStorage value:', oldValue);
  localStorage.removeItem('preferredLanguage');
  console.log('Language reset utility: Removed preferredLanguage from localStorage');
  
  // Step 2: Set to the desired language (default to spanish since that's what user wants)
  localStorage.setItem('preferredLanguage', 'spanish');
  console.log('Language reset utility: Set preferredLanguage to spanish');
  
  // Step 3: Dispatch an event for React components to pick up
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: 'spanish' }
  }));
  console.log('Language reset utility: Dispatched languageChanged event');
  
  // Step 4: Reload the page to ensure all components reinitialize with correct language
  console.log('Language reset utility: Reloading page in 1 second...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  return 'Language reset process started. Page will reload shortly.';
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.resetLanguageSettings = resetLanguageSettings;
  console.log('Language reset utility loaded. Run resetLanguageSettings() to fix language issues.');
}

export { resetLanguageSettings };
