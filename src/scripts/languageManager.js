// Simple, reliable language management script
document.addEventListener('DOMContentLoaded', function() {
  initializeLanguageSelector();
});

function initializeLanguageSelector() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;
  
  // Set initial value
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'french';
  selector.value = savedLanguage;
  
  // Add change listener
  selector.addEventListener('change', handleLanguageChange);
  
  console.log('Language selector initialized with:', savedLanguage);
}

function handleLanguageChange(event) {
  const newLanguage = event.target.value;
  
  // Save to localStorage
  localStorage.setItem('preferredLanguage', newLanguage);
  
  // Dispatch event for React components to listen to
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: newLanguage }
  }));
  
  console.log('Language changed to:', newLanguage);
  
  // Force reload the page to ensure all components pick up the new language
  window.location.reload();
}
