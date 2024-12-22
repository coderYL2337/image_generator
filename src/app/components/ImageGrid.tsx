// src/app/components/ImageGrid.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, Trash2, X, Clock } from "lucide-react";

interface Image {
  id: string;
  url: string;
  prompt: string;
  createdAt: Date;
  latency: number;
  isFavorite: boolean;
}

interface ImageGridProps {
  images: Image[];
  onDelete: (id: string) => Promise<void>;
  onFavorite: (id: string) => Promise<void>;
}

export function ImageGrid({ images, onDelete, onFavorite }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredImages = images.filter(image => {
    if (showFavorites && !image.isFavorite) return false;
    if (
      searchQuery &&
      !image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`p-2 rounded-lg ${showFavorites ? "bg-pink-100 text-pink-600" : "bg-gray-100"}`}
        >
          <Heart className={showFavorites ? "fill-current" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // className={`relative rounded-lg overflow-hidden ${index === 0 ? "md:col-span-2 lg:col-span-3" : ""}`}
            className={`relative rounded-lg overflow-hidden ${
              index === 0 ? "h-[400px]" : "h-[300px]"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={image.url}
                alt={image.prompt}
                //   className="w-full h-full object-cover cursor-pointer"
                className="w-full h-full object-contain cursor-pointer bg-gray-100"
                onClick={() => setSelectedImage(image)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                <p className="text-white text-sm">{image.prompt}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-white/80" />
                  <span className="text-white/80 text-xs">
                    {image.latency}ms
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  // onClick={() => onFavorite(image.id)}
                  onClick={e => {
                    e.stopPropagation();
                    onFavorite(image.id);
                  }}
                  className="p-1 rounded-full bg-white/80 hover:bg-white"
                >
                  <Heart
                    className={`w-4 h-4 ${image.isFavorite ? "fill-pink-600 text-pink-600" : ""}`}
                  />
                </button>
                <button
                  // onClick={() => onDelete(image.id)}
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  className="p-1 rounded-full bg-white/80 hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {/* {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 p-1"
                onClick={() => setSelectedImage(null)}
              >
                <X />
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full rounded-t-lg"
              />
              <div className="p-4">
                <p className="text-lg">{selectedImage.prompt}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generated on{" "}
                  {new Date(selectedImage.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Generation time: {selectedImage.latency}ms
                </p>
              </div>
            </div>
          </motion.div>
        )} */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)} // Add this click handler to close on background click
          >
            <div
              //   className="relative max-w-4xl w-full bg-white rounded-lg"
              className="relative max-w-4xl w-full bg-white rounded-lg max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking the image itself
            >
              <button
                className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"
                onClick={() => setSelectedImage(null)} // Add close button
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1 min-h-0 overflow-auto">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto object-contain max-h-[70vh]"
                  // className="w-full rounded-t-lg"
                />
                <div className="p-4">
                  <p className="text-lg">{selectedImage.prompt}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Generated on{" "}
                    {new Date(selectedImage.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Generation time: {selectedImage.latency}ms
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
