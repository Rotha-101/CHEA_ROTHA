import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
}

export default function Blog() {
  const { blog, blogLoaded, fetchBlog, settings } = useDataStore();
 
  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);
 
  const posts = blog
    .filter((p: any) => p.status === 'published')
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
 
  if (!blogLoaded) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
 
  if (posts.length === 0) return null;
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mb-16"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.blogTitle || 'Latest Articles'}
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {settings?.blogSubtitle || 'Thoughts, tutorials, and insights on software development.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group flex flex-col bg-zinc-50 dark:bg-white/5 rounded-[32px] overflow-hidden border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,77,77,0.08)]"
          >
            {post.imageUrl && (
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            )}
            <div className="flex flex-col flex-grow p-8">
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-5">
                <Calendar className="w-3.5 h-3.5 text-[#ff4d4d]" />
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-4 group-hover:text-[#ff4d4d] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono font-bold uppercase rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to={`/blog/${post.id}`} className="inline-flex items-center text-sm font-bold text-[#ff4d4d] hover:text-[#ff3333] transition-colors mt-auto group/btn">
                Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
