import { ClerkProvider } from "@clerk/clerk-react";
import LanguageLearningApp from "./components/LanguageLearningApp";

function App() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <div>Missing Publishable Key</div>;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <LanguageLearningApp />
    </ClerkProvider>
  );
}

export default App;
