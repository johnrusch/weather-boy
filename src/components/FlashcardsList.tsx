import React, { useState, useEffect } from "react";
import { Download, BookmarkPlus, Check, Loader2, X } from "lucide-react";
import { Flashcard } from "../types/prompt";
import { useStore } from "@nanostores/react";
import { $authStore, $userStore } from "@clerk/astro/client";

interface FlashcardsListProps {
  flashcards: Flashcard[];
  promptId?: string;
  language?: string;
  showSaveButton?: boolean;
}

export const FlashcardsList: React.FC<FlashcardsListProps> = ({
  flashcards,
  promptId,
  language = "french",
  showSaveButton = true,
}) => {
  const auth = useStore($authStore);
  const user = useStore($userStore);
  const { userId } = user;

  const [selectedFlashcards, setSelectedFlashcards] = useState<Flashcard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFlashcards(
      flashcards.map((card) => ({
        ...card,
        isSelected: true,
      })),
    );
  }, [flashcards]);

  const toggleFlashcard = (index: number) => {
    setSelectedFlashcards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, isSelected: !card.isSelected } : card,
      ),
    );
  };

  const selectAllFlashcards = () => {
    setSelectedFlashcards((prev) =>
      prev.map((card) => ({ ...card, isSelected: true })),
    );
  };

  const deselectAllFlashcards = () => {
    setSelectedFlashcards((prev) =>
      prev.map((card) => ({ ...card, isSelected: false })),
    );
  };

  const saveFlashcards = async () => {
    if (!userId) {
      setSaveResult("You must be logged in to save flashcards");
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const selected = selectedFlashcards.filter((card) => card.isSelected);

      if (selected.length === 0) {
        setSaveResult("No flashcards selected");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/saved-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: selected.map((card) => ({
            ...card,
            language, // Include the language
            userId,
          })),
          promptId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveResult(`Successfully saved ${selected.length} flashcards`);
        // Don't automatically deselect after saving, let user continue to work with their selection
      } else {
        setSaveResult(`Error: ${data.error || "Failed to save flashcards"}`);
      }
    } catch (error) {
      console.error("Error saving flashcards:", error);
      setSaveResult("An error occurred while saving flashcards");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    const selected = selectedFlashcards.filter((card) => card.isSelected);

    if (selected.length === 0) {
      setSaveResult("No flashcards selected for download");
      return;
    }

    const languageCapitalized =
      language.charAt(0).toUpperCase() + language.slice(1);
    let csvContent = `${languageCapitalized},English,Type\n`;

    selected.forEach((card) => {
      // Safely handle quotes in the text fields
      const targetLanguage =
        card.targetLanguage?.replace(/"/g, '""') ||
        card.french?.replace(/"/g, '""') ||
        "";
      const english = card.english.replace(/"/g, '""');

      csvContent += `"${targetLanguage}","${english}","${card.type}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${languageCapitalized}_Flashcards_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaveResult(`Successfully downloaded ${selected.length} flashcards`);
    setTimeout(() => setSaveResult(null), 3000);
  };

  return (
    <div className="mt-4 relative">
      {/* Toast Notification */}
      {saveResult && (
        <div
          className={`absolute top-0 right-0 p-3 rounded shadow-md z-50 ${
            saveResult.startsWith("Successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saveResult}
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">Flashcards</h3>
        <div className="flex space-x-2">
          {/* Selection Controls */}
          <button
            onClick={selectAllFlashcards}
            className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
          >
            Select All
          </button>
          <button
            onClick={deselectAllFlashcards}
            className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
          >
            Deselect All
          </button>

          {/* Save Button (only if user is logged in) */}
          {showSaveButton && userId && (
            <button
              onClick={saveFlashcards}
              disabled={isSaving}
              className={`px-3 py-1 rounded text-sm flex items-center ${
                isSaving
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <BookmarkPlus className="mr-1 h-4 w-4" />
                  Save Selected
                </>
              )}
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center hover:bg-green-700"
          >
            <Download className="mr-1 h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>

      {flashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFlashcards.map((card, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 relative ${
                card.isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              {/* Make selection button available to all users */}
              <button
                onClick={() => toggleFlashcard(index)}
                className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center ${
                  card.isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {card.isSelected ? <Check size={14} /> : "+"}
              </button>

              <div className="mb-2">
                <span className="text-xs text-gray-500 uppercase">
                  {card.type}
                </span>
                <span className="font-medium text-green-800">
                  {card.targetLanguage}
                </span>
                <p className="text-gray-800 mt-1">{card.english}</p>
              </div>

              {card.originalText && (
                <div className="mt-2 text-sm">
                  <span className="text-xs text-gray-500">Original:</span>
                  <p className="text-gray-600 italic">{card.originalText}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No flashcards generated yet.</p>
      )}
    </div>
  );
};
