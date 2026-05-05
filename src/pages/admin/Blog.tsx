import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Image as ImageIcon, Globe, Eye, EyeOff, Search, Copy, BarChart2, X, ExternalLink, Calendar, Tag, FileText } from 'lucide-react';
import Editor from '../../components/admin/Editor';

const API_URL = '/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

type FormData = Omit<BlogPost, 'id'>;

const inputCls = 'mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d] transition-colors';
const labelCls = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const imageUrl = watch('imageUrl');
  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/blog`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: BlogPost, b: BlogPost) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(data);
    } catch { showToast('Failed to load posts', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const savePosts = async (newPosts: BlogPost[]) => {
    await fetch(`${API_URL}/db/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPosts),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setValue('imageUrl', data.url);
      showToast('Image uploaded');
    } catch { showToast('Upload failed', 'error'); }
    setUploadingImage(false);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const formatted: BlogPost = {
        ...data,
        id: editingId || Date.now().toString(),
        tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map(t => t.trim()).filter(Boolean) : data.tags,
        createdAt: editingId ? (posts.find(p => p.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      };
      const newPosts = editingId
        ? posts.map(p => p.id === editingId ? formatted : p)
        : [formatted, ...posts];
      await savePosts(newPosts);
      setPosts(newPosts);
      closeForm();
      showToast(editingId ? 'Post updated!' : 'Post created!');
    } catch { showToast('Save failed', 'error'); }
    setSaving(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    reset({ ...post, tags: post.tags.join(', ') as any });
    setIsFormOpen(true);
    setActiveTab('content');
    setPreviewMode(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    const newPosts = posts.filter(p => p.id !== id);
    await savePosts(newPosts);
    setPosts(newPosts);
    showToast('Post deleted');
  };

  const handleDuplicate = async (post: BlogPost) => {
    const dupe: BlogPost = { ...post, id: Date.now().toString(), title: `${post.title} (Copy)`, status: 'draft', createdAt: new Date().toISOString() };
    const newPosts = [dupe, ...posts];
    await savePosts(newPosts);
    setPosts(newPosts);
    showToast('Post duplicated');
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const updated = { ...post, status: post.status === 'published' ? 'draft' as const : 'published' as const };
    const newPosts = posts.map(p => p.id === post.id ? updated : p);
    await savePosts(newPosts);
    setPosts(newPosts);
    showToast(`Post ${updated.status}`);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); reset(); setPreviewMode(false); };

  const openNew = () => {
    setEditingId(null);
    reset({ title: '', content: '', excerpt: '', imageUrl: '', tags: [] as any, status: 'draft', createdAt: '', seoTitle: '', seoDescription: '', seoKeywords: '' });
    setIsFormOpen(true);
    setActiveTab('content');
    setPreviewMode(false);
  };

  const filtered = useMemo(() => posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  }), [posts, search, filterStatus]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
  }), [posts]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
            <span className="w-8 h-px bg-[#ff4d4d]/30" />
            INTELLECT
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-4">
            <FileText className="w-8 h-8 text-[#ff4d4d]" /> Blog Terminal
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Publish and manage your architectural thoughts.</p>
        </div>
        {!isFormOpen && (
          <button onClick={openNew} className="group px-6 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 tracking-widest uppercase">
            <Plus className="w-4 h-4" /> Initialize Entry
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'TOTAL_ENTRIES', value: stats.total, icon: FileText, color: 'text-blue-500' },
          { label: 'PUBLISHED_NODES', value: stats.published, icon: Eye, color: 'text-emerald-500' },
          { label: 'DRAFT_SESSIONS', value: stats.drafts, icon: EyeOff, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className={`p-4 rounded-2xl bg-zinc-100 dark:bg-black/20 ${s.color} group-hover:scale-110 transition-transform`}><s.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
              <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{s.label}</p>
            </div>
            <div className={`absolute -right-2 -bottom-2 opacity-10 ${s.color}`}><s.icon className="w-16 h-16 rotate-12" /></div>
          </div>
        ))}
      </div>

      {/* Editor Form */}
      {isFormOpen && (
        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4d4d]/5 blur-[120px] pointer-events-none" />
          {/* Form Header */}
          <div className="flex items-center justify-between px-10 py-6 border-b border-zinc-200 dark:border-white/5">
            <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white">{editingId ? 'Modify Entry' : 'Initialize Node'}</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => setPreviewMode(v => !v)} className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl border transition-all ${previewMode ? 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30' : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
                <Eye className="w-3.5 h-3.5" /> {previewMode ? 'EDITOR_MODE' : 'PREVIEW_OUTPUT'}
              </button>
              <button onClick={closeForm} className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {previewMode ? (
            <div className="p-10 max-h-[80vh] overflow-y-auto">
              {imageUrl && <img src={imageUrl} alt="" className="w-full max-h-[400px] object-cover rounded-3xl mb-10 shadow-2xl border border-zinc-200 dark:border-white/10" />}
              <h1 className="text-5xl font-display font-bold text-zinc-900 dark:text-white mb-6 tracking-tight leading-tight">{watchedTitle || 'Untitled Module'}</h1>
              <div className="prose prose-xl max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight" dangerouslySetInnerHTML={{ __html: watchedContent || '<p class="text-zinc-500 font-mono uppercase tracking-widest py-20 text-center">Null content stream detected...</p>' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Tabs */}
              <div className="flex gap-2 px-10 pt-8">
                {(['content', 'seo', 'settings'] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === tab ? 'bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'}`}>
                    {tab}_BUFFER
                  </button>
                ))}
              </div>

              <div className="p-10 space-y-8">
                {activeTab === 'content' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <div className="sm:col-span-3 space-y-2">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Title *</label>
                        <input {...register('title', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" placeholder="Entry identification..." />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Visibility Status</label>
                        <select {...register('status')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold appearance-none">
                          <option value="draft" className="bg-white dark:bg-[#0a0a0a]">DRAFT_MODE</option>
                          <option value="published" className="bg-white dark:bg-[#0a0a0a]">PUBLIC_BROADCAST</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Excerpt *</label>
                      <textarea rows={2} {...register('excerpt', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-medium leading-relaxed" placeholder="Abstract of the publication..." />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Rich Content Stream *</label>
                      <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/5">
                        <Editor content={watch('content')} onChange={html => setValue('content', html)} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Hero Asset</label>
                      <div className="flex items-center gap-8 p-6 rounded-2xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/5">
                        {imageUrl ? (
                          <div className="relative group">
                            <img src={imageUrl} alt="" className="h-24 w-40 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <ImageIcon className="text-white w-6 h-6" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 w-40 bg-zinc-100 dark:bg-white/5 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-400 text-[10px] font-mono">NULL_ASSET</div>
                        )}
                        <div className="flex-1 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer w-fit px-6 py-3 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-[#ff4d4d]/30 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all text-[10px] font-mono font-bold uppercase tracking-widest">
                            <ImageIcon className="w-4 h-4" />
                            {uploadingImage ? 'Uploading...' : 'Link Asset'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          {imageUrl && <p className="text-[10px] font-mono text-zinc-400 truncate max-w-xs">{imageUrl}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Taxonomy Tags <span className="opacity-40 font-normal">(Comma Separated)</span></label>
                      <input {...register('tags' as any)} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" placeholder="ARCHITECTURE, NEURAL, WEB_3..." />
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-[#ff4d4d]/5 border border-[#ff4d4d]/10 rounded-2xl text-[10px] font-mono font-bold text-[#ff4d4d] tracking-widest uppercase flex items-start gap-4">
                      <Globe className="w-5 h-5 shrink-0" />
                      <p className="leading-relaxed">Discovery engine optimization protocols. These parameters enhance the indexing and visibility of the intellectual module.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Search Engine Headline</label>
                      <input {...register('seoTitle')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" placeholder="Default: Entry Title" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Meta Abstract <span className="opacity-40 font-normal">(160 Chars Max)</span></label>
                      <textarea rows={3} {...register('seoDescription')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" placeholder="Brief summary for crawler indexing..." maxLength={160} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Indexing Keywords</label>
                      <input {...register('seoKeywords')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" placeholder="keyword_1, keyword_2, keyword_3..." />
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Chronology Timestamp</label>
                      <input type="datetime-local" {...register('createdAt')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono font-bold" />
                      <p className="text-[10px] font-mono text-zinc-400 mt-2 ml-1">Temporal ordering of the publication node.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Asset Source URL</label>
                      <input {...register('imageUrl')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" placeholder="External link or linked asset above..." />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 px-10 py-6 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-black/40">
                <button type="button" onClick={closeForm} className="px-6 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 text-zinc-500 text-xs font-bold hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all tracking-widest uppercase">
                  Abort
                </button>
                <button type="submit" disabled={saving} className="px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all tracking-widest uppercase flex items-center gap-3">
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />SYNCING...</> : 'Commit Entry'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Entry Registry..." className="w-full pl-14 pr-6 py-4 border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white text-sm font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]/50 transition-all placeholder:text-zinc-500 placeholder:font-mono placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest shadow-lg" />
        </div>
        <div className="flex gap-3">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-6 py-4 text-[10px] font-mono font-bold rounded-2xl capitalize transition-all border tracking-widest uppercase shadow-lg ${filterStatus === s ? 'bg-[#ff4d4d] text-white border-[#ff4d4d] shadow-[#ff4d4d]/20' : 'border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-white/5'}`}>
              {s}_MODE
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center text-zinc-500 flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-[40px]">
            <span className="w-10 h-10 border-4 border-[#ff4d4d]/20 border-t-[#ff4d4d] rounded-full animate-spin" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest">Synchronizing Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-dashed rounded-[40px]">
            <BarChart2 className="w-12 h-12 text-zinc-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest">{search ? 'NO_MATCHING_RECORDS' : 'REGISTRY_VACANT'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(post => (
              <div key={post.id} className="group bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-5 transition-all hover:border-[#ff4d4d]/20 hover:shadow-[0_0_30px_rgba(255,77,77,0.05)] flex items-center gap-6">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="h-20 w-32 object-cover rounded-2xl border border-zinc-200 dark:border-white/10 shadow-lg group-hover:scale-105 transition-all duration-500 shrink-0" />
                ) : (
                  <div className="h-20 w-32 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/5">
                    <ImageIcon className="h-6 w-6 text-zinc-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate group-hover:text-[#ff4d4d] transition-colors tracking-tight">{post.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate font-medium">{post.excerpt}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3 text-[#ff4d4d]/50" />{new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.tags?.filter(Boolean).length > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">
                        <Tag className="w-3 h-3 text-[#ff4d4d]/50" />{post.tags.filter(Boolean).slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <a href={`/blog/${post.id}`} target="_blank" rel="noreferrer" title="Output Preview" className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-sm">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleToggleStatus(post)} title="Toggle Visibility" className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm">
                    {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(post)} title="Modify Node" className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 transition-all shadow-sm">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} title="Purge Record" className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
