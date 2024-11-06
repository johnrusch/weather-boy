import { ClerkProvider } from '@clerk/clerk-react';
import FrenchLearningApp from './components/FrenchLearningApp';
import AuthLayout from './layouts/AuthLayout';

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthLayout>
        <FrenchLearningApp />
      </AuthLayout>
    </ClerkProvider>
  );
}