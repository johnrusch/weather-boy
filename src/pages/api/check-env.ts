import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const hasMongoURI = !!import.meta.env.MONGODB_URI;
    const hasOpenAIKey = !!import.meta.env.OPENAI_API_KEY;

    return new Response(
      JSON.stringify({
        environment: import.meta.env.MODE,
        hasMongoURI,
        hasOpenAIKey,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error checking environment:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to check environment",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
