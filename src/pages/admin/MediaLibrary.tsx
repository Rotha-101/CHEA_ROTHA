import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Copy, Image as ImageIcon, FileText, UploadCloud, Search, Folder, ExternalLink } from 'lucide-react';

const API_URL = '/api';

interface MediaFile {
  name: string;
  url: string;
  path: string;
  type: 'image' | 'document' | 'other';
  categories?: string[];
}

interface DBData {
  profile?: any;
  projects?: any[];
  skills?: any[];
  blog?: any[];
  experience?: any[];
  education?: any[];
  gallery?: any[];
}

// Extract all string URLs from a value recursively
function extractUrls(value: any): string[] {
  if (!value) return [];
  if (typeof value === 'string' && value.startsWith('http')) return [value];
  if (Array.isArray(value)) return value.flatMap(extractUrls);
  if (typeof value === 'object') return Object.values(value).flatMap(extractUrls);
  return [];
}

const CATEGORIES = [
  { id: 'all',        label: 'All',        color: 'bg-[#ff4d4d] text-zinc-950' },
  { id: 'profile',    label: 'Profile',    color: 'bg-blue-500 text-white' },
  { id: 'background', label: 'Background', color: 'bg-purple-500 text-white' },
  { id: 'experience', label: 'Experience', color: 'bg-green-500 text-white' },
  { id: 'education',  label: 'Education',  color: 'bg-cyan-500 text-white' },
  { id: 'projects',   label: 'Projects',   color: 'bg-orange-500 text-white' },
  { id: 'blog',       label: 'Blog',       color: 'bg-pink-500 text-white' },
  { id: 'gallery',    label: 'Gallery',    color: 'bg-indigo-500 text-white' },
  { id: 'other',      label: 'Other',      color: 'bg-zinc-500 text-white' },
];

let mediaCache: MediaFile[] | null = null;

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>(mediaCache || []);
  const [loading, setLoading] = useState(!mediaCache);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Categorize a file by checking if its URL appears in any DB collection
  const categorizeFiles = useCallback(async (mediaFiles: MediaFile[]) => {
    try {
      const collections: Record<string, string> = {
        profile: 'profile',
        projects: 'projects',
        blog: 'blog',
        experience: 'experience',
        education: 'education',
        gallery: 'gallery',
      };

      // Fetch all DB data in parallel
      const results = await Promise.allSettled(
        Object.entries(collections).map(async ([key, col]) => {
          const res = await fetch(`${API_URL}/db/${col}`);
          return [key, await res.json()] as [string, any];
        })
      );

      const dbData: DBData = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          const [key, data] = r.value;
          (dbData as any)[key] = data;
        }
      });

      // Map: url → categories[]
      const urlCategoryMap: Record<string, string[]> = {};

      // Profile photo & cover
      const profileUrls: string[] = [];
      if (dbData.profile?.profilePhotoUrl) profileUrls.push(dbData.profile.profilePhotoUrl);
      if (dbData.profile?.coverImageUrl) profileUrls.push(dbData.profile.coverImageUrl);
      if (dbData.profile?.cvUrl) profileUrls.push(dbData.profile.cvUrl);
      profileUrls.forEach(url => {
        // Distinguish cover image as background
        if (url === dbData.profile?.coverImageUrl) {
          urlCategoryMap[url] = [...(urlCategoryMap[url] || []), 'background'];
        } else {
          urlCategoryMap[url] = [...(urlCategoryMap[url] || []), 'profile'];
        }
      });

      // Collections
      const collectionMap: [string, any[] | undefined][] = [
        ['projects', dbData.projects],
        ['blog', dbData.blog],
        ['experience', dbData.experience],
        ['education', dbData.education],
        ['gallery', dbData.gallery],
      ];

      collectionMap.forEach(([cat, items]) => {
        (items || []).forEach(item => {
          extractUrls(item).forEach(url => {
            if (!urlCategoryMap[url]) urlCategoryMap[url] = [];
            if (!urlCategoryMap[url].includes(cat)) urlCategoryMap[url].push(cat);
          });
        });
      });

      // Assign categories to each file
      return mediaFiles.map(f => ({
        ...f,
        categories: urlCategoryMap[f.url] || ['other'],
      }));
    } catch (err) {
      console.error('Failed to categorize media:', err);
      return mediaFiles.map(f => ({ ...f, categories: ['other'] }));
    }
  }, []);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/media`);
      if (!res.ok) throw new Error('Failed to fetch media');
      let data: MediaFile[] = await res.json();
      data = await categorizeFiles(data);
      setFiles(data);
      mediaCache = data;
    } catch (err) {
      console.error('Error fetching media:', err);
    }
    setLoading(false);
  }, [categorizeFiles]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      await fetchMedia(); // Re-categorize after upload
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Delete this file permanently?')) return;
    setFiles(prev => prev.filter(f => f.path !== path));
    try {
      await fetch(`${API_URL}/media/${path}`, { method: 'DELETE' });
    } catch {
      alert('Failed to delete file.');
      fetchMedia();
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredFiles = files.filter(f => {
    const matchCat = activeCategory === 'all' || (f.categories || []).includes(activeCategory);
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCategoryColor = (catId: string) => CATEGORIES.find(c => c.id === catId)?.color || 'bg-zinc-500 text-white';
  const getCategoryCount = (catId: string) =>
    catId === 'all' ? files.length : files.filter(f => (f.categories || []).includes(catId)).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Media Library</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{files.length} files • Auto-categorized by usage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-lg text-sm focus:ring-[#ff4d4d] focus:border-[#ff4d4d] outline-none w-56"
            />
          </div>
          <div className="relative">
            <input type="file" id="media-upload" className="hidden" onChange={handleUpload} disabled={uploading} />
            <label
              htmlFor="media-upload"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-zinc-950 bg-[#ff4d4d] hover:bg-[#ff4d4d] transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        {CATEGORIES.map(cat => {
          const count = getCategoryCount(cat.id);
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? cat.color
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-[#ff4d4d]'
              }`}
            >
              {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff4d4d] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400 font-mono text-xs uppercase tracking-widest animate-pulse">Loading & categorizing media...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="col-span-full py-16 text-center text-zinc-500 dark:text-zinc-400 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
          <Folder className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No files found{activeCategory !== 'all' ? ` in "${activeCategory}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map(file => (
            <div key={file.path} className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:border-[#ff4d4d]/50 transition-all">
              {/* Thumbnail */}
              <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                ) : file.type === 'document' ? (
                  <FileText className="h-10 w-10 text-zinc-400" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-zinc-400" />
                )}
              </div>

              {/* Category badges */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {(file.categories || []).filter(c => c !== 'other').map(cat => (
                  <span key={cat} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getCategoryColor(cat)}`}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* File info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate" title={file.name}>
                  {file.name.replace(/^\d+-\d+-/, '')}
                </p>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopy(file.url)}
                  className="p-2 bg-white text-zinc-900 rounded-full hover:bg-[#ff4d4d] transition-colors"
                  title={copiedUrl === file.url ? 'Copied!' : 'Copy URL'}
                >
                  <Copy className={`h-4 w-4 ${copiedUrl === file.url ? 'text-green-600' : ''}`} />
                </button>
                <a href={file.url} target="_blank" rel="noreferrer" className="p-2 bg-white text-zinc-900 rounded-full hover:bg-blue-50 transition-colors" title="Open">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.path)}
                  className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
