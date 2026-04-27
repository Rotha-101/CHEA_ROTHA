import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';

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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/db/blog`);
        if (!res.ok) throw new Error('Failed to fetch blog');
        const allPosts = (await res.json()) || [];
        const data = allPosts
          .filter((p: any) => p.status === 'published')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Latest Articles</h2>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">Thoughts, tutorials, and insights on software development.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
          >
            {post.imageUrl && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="flex flex-col flex-grow p-6">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-4">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="inline-flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors mt-auto">
                Read Article <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
