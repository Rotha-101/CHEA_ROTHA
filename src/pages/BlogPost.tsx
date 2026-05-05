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
    window.scrollTo(0, 0);
  }, [id, fetchBlog, fetchProfileAndSkills, fetchSettings]);

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
      <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans bg-white dark:bg-[#050810]">
        <div className="relative z-10 flex flex-1 items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Not found state
  if (blogLoaded && !post) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans bg-white dark:bg-[#050810]">
        <div className="relative z-10 flex flex-1 items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8 bg-zinc-50 dark:bg-white/5 backdrop-blur-2xl rounded-[40px] p-16 border border-zinc-200 dark:border-white/5 shadow-2xl max-w-2xl">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#ff4d4d]/5 border border-[#ff4d4d]/10 mb-6">
              <BookOpen className="w-12 h-12 text-[#ff4d4d]" />
            </div>
            <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Article Not Found</h1>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              The article you are looking for doesn't exist or has been relocated within our neural network.
            </p>
            <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-[#ff4d4d]/20 hover:scale-[1.02]">
              <ChevronLeft className="w-5 h-5" />
              Return to Terminal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans bg-white dark:bg-[#050810] transition-colors duration-500">
      {/* Background Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(255,77,77,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#ff4d4d] z-[70] origin-left shadow-[0_0_10px_#ff4d4d]" style={{ scaleX }} />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[60] w-full border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#050810]/80 backdrop-blur-2xl saturate-150 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all group font-bold text-sm tracking-tight">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:border-[#ff4d4d]/30 transition-all">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>BACK TO FEED</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} title="Copy link" className="p-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl hover:border-[#ff4d4d]/30 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              {copied ? <Check className="w-5 h-5 text-[#ff4d4d]" /> : <LinkIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleTwitterShare} title="Share on Twitter" className="p-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl hover:border-[#ff4d4d]/30 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              <Twitter className="w-5 h-5" />
            </button>
            <button onClick={handleLinkedInShare} title="Share on LinkedIn" className="p-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl hover:border-[#ff4d4d]/30 transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow pb-32">
        <div className="h-12"></div>

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left social sidebar */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col items-center">
            <div className="sticky top-32 flex flex-col gap-4">
              <button onClick={handleCopyLink} title="Copy Link" className="p-4 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-500 hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 transition-all shadow-sm">
                {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </button>
              <button onClick={handleTwitterShare} title="Share on Twitter" className="p-4 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </button>
              <button onClick={handleLinkedInShare} title="Share on LinkedIn" className="p-4 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all shadow-sm">
                <Linkedin className="w-5 h-5" />
              </button>
              <div className="w-px h-12 bg-zinc-200 dark:bg-white/10 mx-auto my-2" />
              <button title="Comment" className="p-4 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-500 hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 transition-all shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Main article content */}
          <article className="lg:col-span-7">
            <header className="mb-12">
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#ff4d4d] mb-6">
                <span className="w-8 h-px bg-[#ff4d4d]/30" />
                Latest Insight
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-8 leading-[1.1]">
                {post!.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#ff4d4d]" />
                  {new Date(post!.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#ff4d4d]" />
                  {readingTime} MIN READ
                </div>
              </div>
            </header>

            {post!.imageUrl && (
              <div className="mb-16 rounded-[40px] overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl relative group">
                <img src={post!.imageUrl} alt={post!.title} className="w-full h-auto object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-[#050810]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            )}

            <div
              className="prose dark:prose-invert prose-zinc max-w-none 
                prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-zinc-900 dark:prose-h2:text-white
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg
                prose-a:text-[#ff4d4d] prose-a:no-underline hover:prose-a:text-[#ff3333] prose-a:transition-colors
                prose-blockquote:border-[#ff4d4d] prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-white/5 prose-blockquote:rounded-2xl prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:italic
                prose-code:text-[#ff4d4d] prose-code:bg-zinc-50 dark:prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-zinc-950 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-white/5 prose-pre:rounded-3xl prose-pre:p-8
              "
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Tags */}
            {post!.tags.filter(Boolean).length > 0 && (
              <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-white/5">
                <div className="flex flex-wrap gap-3 items-center">
                  <Tag className="w-4 h-4 text-[#ff4d4d]" />
                  {post!.tags.filter(Boolean).map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full hover:border-[#ff4d4d]/30 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Card */}
            {profileLoaded && profile && (
              <section className="mt-16 p-10 bg-zinc-50 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4d4d]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col sm:flex-row items-center gap-10 relative z-10">
                  {profile.profilePhotoUrl && (
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/10 group-hover:border-[#ff4d4d]/30 transition-all duration-500">
                      <img src={profile.profilePhotoUrl} alt={profile.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff4d4d] mb-2">Author</p>
                    <h4 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-3">{profile.name}</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6 max-w-lg">{profile.bio}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.email && (
                        <a href={`mailto:${profile.email}`} className="p-3 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all">
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
            <div className="sticky top-32 space-y-8">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="p-8 bg-zinc-50 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-lg">
                  <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff4d4d] mb-8 flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    Neural Index
                  </h5>
                  <nav className="space-y-2">
                    {headings.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className={`w-full text-left text-xs font-bold transition-all py-3 px-4 rounded-2xl group ${
                          activeHeading === h.id
                            ? 'text-zinc-900 dark:text-white bg-[#ff4d4d]/10 border border-[#ff4d4d]/20'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent ' + (h.level === 'h3' ? 'ml-4' : '')
                        }`}
                      >
                        <span className={`inline-block mr-2 transition-transform ${activeHeading === h.id ? 'translate-x-1 text-[#ff4d4d]' : 'opacity-0'}`}>⟩</span>
                        {h.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Article Meta */}
               <div className="p-8 bg-zinc-50 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-zinc-200 dark:border-white/5 shadow-lg space-y-6">
                <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
                  <Eye className="w-4 h-4" />
                  Meta Information
                </h5>
                <div className="space-y-4 text-xs font-bold uppercase tracking-tighter">
                  <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                    <span className="text-zinc-500">Released</span>
                    <span className="text-zinc-900 dark:text-white">{new Date(post!.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-white/5">
                    <span className="text-zinc-500">Runtime</span>
                    <span className="text-zinc-900 dark:text-white">{readingTime} MIN</span>
                  </div>
                  {post!.tags.filter(Boolean).length > 0 && (
                    <div className="flex flex-col gap-4 py-3">
                      <span className="text-zinc-500">Classifiers</span>
                      <div className="flex flex-wrap gap-2">
                        {post!.tags.filter(Boolean).map(t => (
                          <span key={t} className="px-2.5 py-1 bg-[#ff4d4d]/5 border border-[#ff4d4d]/10 text-[#ff4d4d] text-[8px] font-mono rounded-lg">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Newsletter Card */}
              <div className="p-10 bg-[#ff4d4d] rounded-[40px] shadow-2xl shadow-[#ff4d4d]/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <h5 className="text-2xl font-display font-bold text-white mb-3">Sync Insights</h5>
                  <p className="text-white/80 text-sm mb-8 leading-relaxed font-medium">Join the network for weekly neural transmissions on software architecture.</p>
                  <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="email"
                      placeholder="neural@address.io"
                      className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all text-sm font-bold"
                    />
                    <button className="w-full py-4 bg-white text-[#ff4d4d] font-bold rounded-2xl hover:bg-white/90 transition-all text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                      ACTIVATE SYNC
                    </button>
                  </form>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-1000">
                  <Mail className="w-40 h-40 text-white" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-32">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff4d4d] mb-3">Keep Exploring</div>
                <h3 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">More transmissions</h3>
              </div>
              <Link to="/" className="text-sm font-bold text-[#ff4d4d] hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-2 group/all">
                VIEW ARCHIVE <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={`/blog/${p.id}`} className="group flex flex-col bg-zinc-50 dark:bg-white/5 rounded-[40px] overflow-hidden border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,77,77,0.08)] h-full">
                    {p.imageUrl && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col">
                      <h4 className="text-xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors mb-4 line-clamp-2">
                        {p.title}
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                        {p.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-white/5">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">{p.tags.filter(Boolean)[0]}</span>
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#ff4d4d] transition-all">
                          <ArrowRight className="w-4 h-4 text-[#ff4d4d] group-hover:text-white transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>


    </div>
  );
}
