---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="Language Debug Tool">
  <div class="language-debug-tool" id="language-debug-container"></div>
</MainLayout>

<script>
  // Load the React component client-side only
  import { createElement } from 'react';
  import { createRoot } from 'react-dom/client';
  import { LanguageDebugPage } from '../components/LanguageDebugPage';
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('language-debug-container');
    if (container) {
      const root = createRoot(container);
      root.render(createElement(LanguageDebugPage));
    }
  });
</script>

// This component is imported and rendered on the client side from the script above
  const { language, setLanguage } = useLanguage();
  const [localStorageValue, setLocalStorageValue] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Update local state from localStorage
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('preferredLanguage');
      setLocalStorageValue(storedValue);
    }
  }, []);

  const refreshValues = () => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('preferredLanguage');
      setLocalStorageValue(storedValue);
      setMessage('Current values refreshed');
      setStatus('success');
    }
  };

  const setToSpanish = () => {
    try {
      // Update context
      setLanguage('spanish');
      
      // Update localStorage directly
      localStorage.setItem('preferredLanguage', 'spanish');
      
      // Dispatch event for non-React components
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: 'spanish' }
      }));
      
      // Update UI
      setLocalStorageValue('spanish');
      setMessage('Language set to Spanish! Page will reload in 2 seconds.');
      setStatus('success');
      
      // Reload page after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(`Error setting language: ${error}`);
      setStatus('error');
    }
  };

  const setToFrench = () => {
    try {
      // Update context
      setLanguage('french');
      
      // Update localStorage directly
      localStorage.setItem('preferredLanguage', 'french');
      
      // Dispatch event for non-React components
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: 'french' }
      }));
      
      // Update UI
      setLocalStorageValue('french');
      setMessage('Language set to French! Page will reload in 2 seconds.');
      setStatus('success');
      
      // Reload page after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(`Error setting language: ${error}`);
      setStatus('error');
    }
  };

  const resetLanguage = () => {
    try {
      resetLanguageSettings();
      setMessage('Language reset process started. Page will reload shortly.');
      setStatus('success');
    } catch (error) {
      setMessage(`Error resetting language: ${error}`);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Language Settings Debug Tool</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Context Language:</p>
            <p className="text-lg font-medium">{language}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">localStorage Value:</p>
            <p className="text-lg font-medium">{localStorageValue || '(not set)'}</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <button 
            onClick={refreshValues}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Refresh Values
          </button>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${
            status === 'success' ? 'bg-green-100 text-green-800' : 
            status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Fix Language Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button 
            onClick={setToSpanish}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
          >
            Set to Spanish
          </button>
          
          <button 
            onClick={setToFrench}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
          >
            Set to French
          </button>
          
          <button 
            onClick={resetLanguage}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded"
          >
            Reset Language Settings
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Note: Each action will reload the page to ensure all components update properly.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Developer Notes</h2>
        
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            The language context is managed in <code className="text-pink-600 bg-gray-100 px-1 py-0.5 rounded">src/contexts/LanguageContext.tsx</code>
          </li>
          <li>
            The HeaderLanguageSelector component is in <code className="text-pink-600 bg-gray-100 px-1 py-0.5 rounded">src/components/HeaderLanguageSelector.tsx</code>
          </li>
          <li>
            Language settings are stored in localStorage under the key <code className="text-pink-600 bg-gray-100 px-1 py-0.5 rounded">preferredLanguage</code>
          </li>
          <li>
            When language changes, the app should dispatch a <code className="text-pink-600 bg-gray-100 px-1 py-0.5 rounded">languageChanged</code> event
          </li>
          <li>
            The main app is in <code className="text-pink-600 bg-gray-100 px-1 py-0.5 rounded">src/components/LanguageLearningApp.tsx</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
