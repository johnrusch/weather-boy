import React from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import FrenchLearningApp from "./FrenchLearningApp";

interface AuthWrapperProps {
  publishableKey: string;
}

export default function AuthWrapper({ publishableKey }: AuthWrapperProps) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <SignedIn>
        <div id="app-container">
          <FrenchLearningApp />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}
