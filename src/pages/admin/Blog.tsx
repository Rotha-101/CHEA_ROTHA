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

const inputCls = 'mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" /> Manage Blog
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Create, edit and manage your articles</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold rounded-xl shadow-md hover:shadow-amber-500/30 transition-all">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-blue-500' },
          { label: 'Published', value: stats.published, icon: Eye, color: 'text-green-500' },
          { label: 'Drafts', value: stats.drafts, icon: EyeOff, color: 'text-yellow-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p><p className="text-xs text-zinc-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Editor Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">{editingId ? 'Edit Post' : 'New Post'}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreviewMode(v => !v)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${previewMode ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {previewMode ? (
            <div className="p-8">
              {imageUrl && <img src={imageUrl} alt="" className="w-full max-h-80 object-cover rounded-2xl mb-8" />}
              <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-4">{watchedTitle || 'Untitled'}</h1>
              <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: watchedContent || '<p class="text-zinc-400">No content yet…</p>' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4">
                {(['content', 'seo', 'settings'] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {activeTab === 'content' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className={labelCls}>Title *</label>
                        <input {...register('title', { required: true })} className={inputCls} placeholder="Post title…" />
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select {...register('status')} className={inputCls}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Excerpt *</label>
                      <textarea rows={2} {...register('excerpt', { required: true })} className={inputCls} placeholder="Short summary shown on the blog listing…" />
                    </div>
                    <div>
                      <label className={labelCls}>Content *</label>
                      <Editor content={watch('content')} onChange={html => setValue('content', html)} />
                    </div>
                    <div>
                      <label className={labelCls}>Featured Image</label>
                      <div className="flex items-center gap-4 mt-1">
                        {imageUrl && <img src={imageUrl} alt="" className="h-20 w-32 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm" />}
                        <div>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400" />
                          {uploadingImage && <p className="text-xs text-amber-500 mt-1 animate-pulse">Uploading…</p>}
                          {imageUrl && <p className="text-xs text-zinc-400 mt-1 truncate max-w-xs">{imageUrl}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Tags <span className="text-zinc-400 font-normal">(comma separated)</span></label>
                      <input {...register('tags' as any)} className={inputCls} placeholder="React, Tutorial, Web Dev" />
                    </div>
                  </>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-5">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                      <Globe className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>These fields help search engines understand your article and improve discoverability.</p>
                    </div>
                    <div>
                      <label className={labelCls}>SEO Title <span className="text-zinc-400 font-normal">(browser tab &amp; search result)</span></label>
                      <input {...register('seoTitle')} className={inputCls} placeholder="Leave empty to use post title" />
                    </div>
                    <div>
                      <label className={labelCls}>Meta Description <span className="text-zinc-400 font-normal">(160 chars max)</span></label>
                      <textarea rows={3} {...register('seoDescription')} className={inputCls} placeholder="Summary shown in search results…" maxLength={160} />
                    </div>
                    <div>
                      <label className={labelCls}>Meta Keywords</label>
                      <input {...register('seoKeywords')} className={inputCls} placeholder="react, tutorial, web" />
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Publish Date</label>
                      <input type="datetime-local" {...register('createdAt')} className={inputCls} />
                      <p className="text-xs text-zinc-400 mt-1">Controls when this post appears in the timeline.</p>
                    </div>
                    <div>
                      <label className={labelCls}>Cover Image URL</label>
                      <input {...register('imageUrl')} className={inputCls} placeholder="https://… or upload above" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <button type="button" onClick={closeForm} className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-zinc-950 text-sm font-bold rounded-lg shadow transition-colors flex items-center gap-2">
                  {saving ? <><span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />Saving…</> : 'Save Post'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…" className="w-full pl-9 pr-4 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors" />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 text-sm font-medium rounded-xl capitalize transition-colors border ${filterStatus === s ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-500 bg-white dark:bg-zinc-900'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart2 className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{search ? 'No posts match your search.' : 'No posts yet. Create your first one!'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map(post => (
              <li key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="h-14 w-20 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm" />
                ) : (
                  <div className="h-14 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{post.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {post.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Calendar className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.tags?.filter(Boolean).length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Tag className="w-3 h-3" />{post.tags.filter(Boolean).slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`/blog/${post.id}`} target="_blank" rel="noreferrer" title="View post" className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleToggleStatus(post)} title={post.status === 'published' ? 'Set to Draft' : 'Publish'} className={`p-2 rounded-lg transition-colors ${post.status === 'published' ? 'text-zinc-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                    {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDuplicate(post)} title="Duplicate" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(post)} title="Edit" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} title="Delete" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
