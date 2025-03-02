import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../flashcards";
import OpenAI from "openai";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe("Flashcards API", () => {
  let mockRequest: Request;
  let mockOpenAIInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup OpenAI mock
    mockOpenAIInstance = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };
    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => mockOpenAIInstance,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return 400 if text is missing", async () => {
    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ language: "french" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error", "Missing or invalid text");
  });

  it("should return 400 if text is not a string", async () => {
    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ text: 123, language: "french" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error", "Missing or invalid text");
  });

  it("should process correctly formatted French text input", async () => {
    // Sample response from OpenAI
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                flashcards: [
                  {
                    targetLanguage: "Je suis allé au marché",
                    english: "I went to the market",
                    type: "correction",
                    originalText: "Je suis allé à le marché",
                  },
                  {
                    targetLanguage: "J'ai acheté des légumes",
                    english: "I bought some vegetables",
                    type: "correction",
                    originalText: "J'ai acheté les légumes",
                  },
                  {
                    targetLanguage: "Je fais mes courses",
                    english: "I do my shopping",
                    type: "variation",
                  },
                  {
                    targetLanguage: "Je m'approvisionne en nourriture",
                    english: "I stock up on food",
                    type: "variation",
                  },
                  {
                    targetLanguage: "Les fruits sont frais",
                    english: "The fruits are fresh",
                    type: "translation",
                  },
                ],
              }),
            },
          },
        },
      ],
    };

    mockOpenAIInstance.chat.completions.create.mockResolvedValue(
      mockOpenAIResponse,
    );

    // French text with grammatical errors
    const frenchText =
      "Bonjour, je suis allé à le marché hier et j'ai acheté les légumes pour le dîner. Les fruits sont très frais.";

    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ text: frenchText, language: "french" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("flashcards");
    expect(responseBody.flashcards).toHaveLength(5);

    // Verify flashcard types
    const correctionCards = responseBody.flashcards.filter(
      (card: any) => card.type === "correction",
    );
    const variationCards = responseBody.flashcards.filter(
      (card: any) => card.type === "variation",
    );
    const translationCards = responseBody.flashcards.filter(
      (card: any) => card.type === "translation",
    );

    expect(correctionCards).toHaveLength(2);
    expect(variationCards).toHaveLength(2);
    expect(translationCards).toHaveLength(1);

    // Verify specific correction cards
    expect(correctionCards[0]).toHaveProperty("originalText");
    expect(correctionCards[1]).toHaveProperty("originalText");
  });

  it("should process correctly formatted Spanish text input", async () => {
    // Sample response from OpenAI
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            function_call: {
              arguments: JSON.stringify({
                flashcards: [
                  {
                    targetLanguage: "Fui al mercado",
                    english: "I went to the market",
                    type: "correction",
                    originalText: "Yo fue al mercado",
                  },
                  {
                    targetLanguage: "Compré algunas verduras",
                    english: "I bought some vegetables",
                    type: "correction",
                    originalText: "Compré las verduras",
                  },
                  {
                    targetLanguage: "Hago mis compras",
                    english: "I do my shopping",
                    type: "variation",
                  },
                  {
                    targetLanguage: "Me abastezco de comida",
                    english: "I stock up on food",
                    type: "variation",
                  },
                  {
                    targetLanguage: "Las frutas están frescas",
                    english: "The fruits are fresh",
                    type: "translation",
                  },
                ],
              }),
            },
          },
        },
      ],
    };

    mockOpenAIInstance.chat.completions.create.mockResolvedValue(
      mockOpenAIResponse,
    );

    // Spanish text with grammatical errors
    const spanishText =
      "Hola, yo fue al mercado ayer y compré las verduras para la cena. Las frutas están muy frescas.";

    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ text: spanishText, language: "spanish" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("flashcards");
    expect(responseBody.flashcards).toHaveLength(5);

    // Verify flashcard types
    const correctionCards = responseBody.flashcards.filter(
      (card: any) => card.type === "correction",
    );
    const variationCards = responseBody.flashcards.filter(
      (card: any) => card.type === "variation",
    );
    const translationCards = responseBody.flashcards.filter(
      (card: any) => card.type === "translation",
    );

    expect(correctionCards).toHaveLength(2);
    expect(variationCards).toHaveLength(2);
    expect(translationCards).toHaveLength(1);
  });

  it("should handle API errors gracefully", async () => {
    mockOpenAIInstance.chat.completions.create.mockRejectedValue(
      new Error("API error"),
    );

    const frenchText = "Bonjour, comment ça va?";

    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ text: frenchText, language: "french" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(500);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "error",
      "Failed to generate flashcards",
    );
  });

  it("should handle missing function call in OpenAI response", async () => {
    // Sample response from OpenAI without function_call
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: "Some content without function call",
          },
        },
      ],
    };

    mockOpenAIInstance.chat.completions.create.mockResolvedValue(
      mockOpenAIResponse,
    );

    const frenchText = "Bonjour, comment ça va?";

    mockRequest = new Request("http://localhost/api/flashcards", {
      method: "POST",
      body: JSON.stringify({ text: frenchText, language: "french" }),
    });

    const response = await POST({ request: mockRequest } as any);
    expect(response.status).toBe(500);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "error",
      "Failed to generate flashcards",
    );
  });
});
