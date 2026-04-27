import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const API_URL = '/api';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, Globe } from 'lucide-react';
import Editor from '../../components/admin/Editor';

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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<BlogPost, 'id'>>();
  const imageUrl = watch('imageUrl');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/blog`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setValue('imageUrl', data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
    setUploadingImage(false);
  };

  const onSubmit = async (data: Omit<BlogPost, 'id'>) => {
    try {
      const formattedData = {
        ...data,
        tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map(t => t.trim()) : data.tags,
        createdAt: data.createdAt || new Date().toISOString()
      };

      let newPosts = [...posts];
      if (editingId) {
        newPosts = newPosts.map(p => p.id === editingId ? { ...formattedData, id: editingId } : p);
      } else {
        newPosts.push({ ...formattedData, id: Date.now().toString() });
      }
      
      await fetch(`${API_URL}/db/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosts)
      });
      
      setIsFormOpen(false);
      setEditingId(null);
      reset();
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    reset({
      ...post,
      tags: post.tags.join(', ') as any
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const newPosts = posts.filter(p => p.id !== id);
      await fetch(`${API_URL}/db/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosts)
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading blog posts...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Blog</h1>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ title: '', content: '', excerpt: '', imageUrl: '', tags: [], status: 'draft', createdAt: new Date().toISOString(), seoTitle: '', seoDescription: '', seoKeywords: '' });
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Post
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Post' : 'New Post'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                <input type="text" {...register('title', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select {...register('status')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt (Short Summary)</label>
                <textarea rows={2} {...register('excerpt', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Content</label>
                <Editor 
                  content={watch('content')} 
                  onChange={(html) => setValue('content', html)} 
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Featured Image</label>
                <div className="mt-2 flex items-center gap-4">
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="h-20 w-32 object-cover rounded-md border border-zinc-200 dark:border-zinc-700" />
                  )}
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400" />
                    {uploadingImage && <span className="text-xs text-amber-600">Uploading...</span>}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags (comma separated)</label>
                <input type="text" {...register('tags' as any)} placeholder="React, Tutorial, Web Dev" className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              {/* SEO Section */}
              <div className="sm:col-span-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
                  <Globe className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-medium">SEO & Marketing</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Meta Title</label>
                    <input type="text" {...register('seoTitle')} placeholder="Browser tab title" className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Meta Keywords</label>
                    <input type="text" {...register('seoKeywords')} placeholder="react, code, advanced" className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Meta Description</label>
                    <textarea rows={3} {...register('seoDescription')} placeholder="Search engine result description..." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors">
                Save Post
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post) => (
            <li key={post.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt="" className="h-12 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-16 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{post.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {post.status}
                      </span>
                      <span className="mx-2">•</span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(post)} className="p-2 text-zinc-400 hover:text-amber-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {posts.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No blog posts found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
