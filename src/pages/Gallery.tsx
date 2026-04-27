import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface MediaItem {
  name: string;
  url: string;
  type: string;
}

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const API_URL = '/api';
        const res = await fetch(`${API_URL}/media`);
        const files: MediaItem[] = await res.json();
        
        // Filter out only images to show in the gallery
        const imageUrls = files.filter(f => f.type === 'image').map(f => f.url);
        setImages(imageUrls);
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchImages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Gallery</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">Moments, setups, and visual explorations.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.1, 1) }}
              className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
            >
              <img src={src} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-600 font-mono text-sm">
          No images in gallery yet. Upload some via the Admin Media Library!
        </div>
      )}
    </div>
  );
}
