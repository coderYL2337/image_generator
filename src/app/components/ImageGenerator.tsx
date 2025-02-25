"use client";

import { useState, useEffect } from "react";
import { ImageGrid } from "./ImageGrid";
import type { Image } from "./ImageGrid"; // Add this import
import { toast } from "react-hot-toast";

interface ImageGeneratorProps {
  generateImage: (
    text: string
  ) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

export default function ImageGenerator({ generateImage }: ImageGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  //   const [images, setImages] = useState([]);
  // src/app/components/ImageGenerator.tsx
  const [images, setImages] = useState<Image[]>([]); // Add type

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const response = await fetch("/api/images");
    const data = await response.json();
    setImages(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      // First, check content safety
      const safetyCheck = await fetch("/api/check-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const safetyResult = await safetyCheck.json();

      if (!safetyResult.safe) {
        toast.error(
          "We cannot generate the image as you described. Please enter something else."
        );
        setInputText(""); // Clear input
        setIsLoading(false);
        return;
      }

      const result = await generateImage(inputText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      if (result.success) {
        fetchImages(); // Refresh images after new generation
      } else {
        throw new Error("No image URL received");
      }
      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/images/${id}/delete`, { method: "POST" });
    fetchImages();
  };

  const handleFavorite = async (id: string) => {
    await fetch(`/api/images/${id}/favorite`, { method: "POST" });
    fetchImages();
  };

  return (
    // TODO: Update the UI here to show the images generated

    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1">
        <ImageGrid
          images={images}
          onDelete={handleDelete}
          onFavorite={handleFavorite}
        />
      </main>
      <footer className="w-full max-w-3xl mx-auto mt-8">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
