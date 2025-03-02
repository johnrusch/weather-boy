import { ClerkProvider } from "@clerk/clerk-react";
import React from "react";

interface ClerkProviderClientProps {
  children: React.ReactNode;
  publishableKey: string;
}

export const ClerkProviderClient: React.FC<ClerkProviderClientProps> = ({
  children,
  publishableKey,
}) => {
  return (
    <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
  );
};
