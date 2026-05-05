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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mb-16"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          Gallery
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">Moments, setups, and visual explorations from my journey.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.5 }}
              className="aspect-square rounded-[32px] overflow-hidden bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 transition-all duration-500"
            >
              <img src={src} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 hover:scale-110 transition-all duration-700" />
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
