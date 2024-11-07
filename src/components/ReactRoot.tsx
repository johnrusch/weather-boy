import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

interface ReactRootProps {
  children: React.ReactNode;
}

export const ReactRoot: React.FC<ReactRootProps> = ({ children }) => {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}; 