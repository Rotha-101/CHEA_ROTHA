import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon, 
  MessageSquare, 
  ArrowRight,
  BookOpen,
  Tag,
  Check,
  Mail,
  Eye
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useThemeStore } from '../store/themeStore';

// Helper to calculate reading time
const calculateReadingTime = (content: string) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Helper to extract headings for ToC and add IDs to the HTML
const processContent = (html: string) => {
  if (!html || typeof document === 'undefined') return { html, headings: [] };
  const div = document.createElement('div');
  div.innerHTML = html;
  const headingEls = Array.from(div.querySelectorAll('h2, h3'));
  const headings = headingEls.map((h, i) => {
    const id = `section-${i}`;
    h.setAttribute('id', id);
    return {
      id,
      text: h.textContent || '',
      level: h.tagName.toLowerCase(),
    };
  });
  return { html: div.innerHTML, headings };
};

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const { blog, blogLoaded, fetchBlog, profile, profileLoaded, fetchProfileAndSkills, settings, fetchSettings } = useDataStore();
  const { theme } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    fetchBlog();
    fetchProfileAndSkills();
    fetchSettings();
  }, [fetchBlog, fetchProfileAndSkills, fetchSettings]);

  // Apply theme class to html element (same as main app)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const post = useMemo(() => {
    if (!blog || blog.length === 0) return null;
    return blog.find(p => String(p.id) === String(id)) || null;
  }, [blog, id]);

  const { html: processedContent, headings } = useMemo(
    () => post ? processContent(post.content) : { html: '', headings: [] },
    [post]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blog
      .filter(p => p.id !== post.id && p.status === 'published' && p.tags.some(t => post.tags.includes(t)))
      .slice(0, 3);
  }, [blog, post]);

  // Active heading tracker
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings, processedContent]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${post?.title} — ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const bgImage = settings?.heroBackgroundImageUrl || profile?.coverImageUrl;
  const readingTime = post ? calculateReadingTime(post.content) : 0;

  // Loading state
  if (!blogLoaded) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans">
        {bgImage && (
          <div aria-hidden className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${bgImage}")` }} />
        )}
        <div aria-hidden className={`fixed inset-0 z-0 pointer-events-none ${bgImage ? 'bg-white/60 dark:bg-zinc-950/50' : 'bg-white dark:bg-zinc-950'}`} />
        <div className="relative z-10 flex flex-1 items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Not found state
  if (blogLoaded && !post) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans">
        {bgImage && (
          <div aria-hidden className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${bgImage}")` }} />
        )}
        <div aria-hidden className={`fixed inset-0 z-0 pointer-events-none ${bgImage ? 'bg-white/60 dark:bg-zinc-950/50' : 'bg-white dark:bg-zinc-950'}`} />
        <div className="relative z-10 flex flex-1 items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-12 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <BookOpen className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">Article Not Found</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              The article you are looking for doesn't exist or has been removed.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-full transition-all shadow-lg hover:shadow-amber-500/30">
              <ChevronLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans transition-colors duration-500">
      {/* Same background system as homepage */}
      {bgImage && (
        <div aria-hidden className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700" style={{ backgroundImage: `url("${bgImage}")` }} />
      )}
      <div aria-hidden className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-500 ${bgImage ? 'bg-white/70 dark:bg-zinc-950/60' : 'bg-white dark:bg-zinc-950'}`} />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 z-[60] origin-left" style={{ scaleX }} />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-xl saturate-150 shadow-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group font-medium">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Blog</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} title="Copy link" className="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-600 dark:text-zinc-400">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleTwitterShare} title="Share on Twitter" className="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-600 dark:text-zinc-400">
              <Twitter className="w-5 h-5" />
            </button>
            <button onClick={handleLinkedInShare} title="Share on LinkedIn" className="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-600 dark:text-zinc-400">
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow pb-24">
        <div className="h-10"></div> {/* Spacer for nav */}

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left social sidebar */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col items-center">
            <div className="sticky top-24 flex flex-col gap-3">
              <button onClick={handleCopyLink} title="Copy Link" className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/40 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 transition-all shadow-sm">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
              </button>
              <button onClick={handleTwitterShare} title="Share on Twitter" className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/40 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </button>
              <button onClick={handleLinkedInShare} title="Share on LinkedIn" className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/40 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-all shadow-sm">
                <Linkedin className="w-5 h-5" />
              </button>
              <button title="Comment" className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/40 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 transition-all shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Main article content */}
          <article className="lg:col-span-7">
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                {post!.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {new Date(post!.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {readingTime} min read
                </div>
              </div>
            </header>

            {post!.imageUrl && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
                <img src={post!.imageUrl} alt={post!.title} className="w-full h-auto object-cover" />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-amber"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Tags */}
            {post!.tags.filter(Boolean).length > 0 && (
              <div className="mt-12 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-zinc-400 mr-1" />
                  {post!.tags.filter(Boolean).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 text-sm font-medium rounded-full border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Card */}
            {profileLoaded && profile && (
              <section className="mt-12 p-8 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/40 dark:border-zinc-800/60 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {profile.profilePhotoUrl && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-500/30 flex-shrink-0">
                      <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Written by</p>
                    <h4 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">{profile.name}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">{profile.bio}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.email && (
                        <a href={`mailto:${profile.email}`} className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </article>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="p-6 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/40 dark:border-zinc-800/60 shadow-lg">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Table of Contents
                  </h5>
                  <nav className="space-y-1">
                    {headings.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className={`w-full text-left text-sm transition-all py-1.5 px-3 rounded-xl ${
                          activeHeading === h.id
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 font-medium'
                            : 'hover:text-amber-500 ' + (h.level === 'h3' ? 'ml-4 text-zinc-400 dark:text-zinc-500' : 'text-zinc-600 dark:text-zinc-400')
                        }`}
                      >
                        {h.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Article Meta */}
              <div className="p-6 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/40 dark:border-zinc-800/60 shadow-lg space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Article Details
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Published</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{new Date(post!.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Reading time</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{readingTime} min</span>
                  </div>
                  {post!.tags.filter(Boolean).length > 0 && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-zinc-500 shrink-0">Topics</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {post!.tags.filter(Boolean).map(t => (
                          <span key={t} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Newsletter Card */}
              <div className="p-7 bg-amber-500 rounded-3xl shadow-xl shadow-amber-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <h5 className="text-xl font-display font-bold text-zinc-950 mb-2">Stay in the loop</h5>
                  <p className="text-zinc-900/70 text-sm mb-5 leading-relaxed">Get the latest articles delivered directly to your inbox.</p>
                  <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 bg-white/25 border border-white/30 rounded-xl text-zinc-950 placeholder:text-zinc-800/50 outline-none focus:bg-white/40 transition-all text-sm font-medium"
                    />
                    <button className="w-full py-2.5 bg-zinc-950 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors text-sm shadow-lg">
                      Subscribe
                    </button>
                  </form>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                  <Mail className="w-28 h-28 text-white" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">More from the blog</h3>
              <Link to="/" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={`/blog/${p.id}`} className="group flex flex-col bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/40 dark:border-zinc-800/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {p.imageUrl && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors mb-2 line-clamp-2">
                        {p.title}
                      </h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">
                        {p.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{p.tags.filter(Boolean)[0]}</span>
                        <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-white/20 dark:border-zinc-800/50 bg-white/20 dark:bg-black/20 backdrop-blur-xl py-10 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono tracking-widest uppercase">
          &copy; {new Date().getFullYear()} {profile?.name || 'Portfolio'}. Crafted for excellence.
        </p>
      </footer>
    </div>
  );
}
