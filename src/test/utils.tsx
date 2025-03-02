import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { vi } from "vitest";

// Mock Clerk's auth hooks
vi.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    userId: "test-user-id",
  }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: () => null,
}));

// Custom render function that includes providers
function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    ...options,
  });
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
