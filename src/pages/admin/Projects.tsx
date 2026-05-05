import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

const API_URL = '/api';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  status: string;
  priority: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Project, 'id'>>();
  const imageUrl = watch('imageUrl');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/projects`);
      let projectsData = await res.json();
      projectsData = Array.isArray(projectsData) ? projectsData : [];
      projectsData.sort((a: any, b: any) => a.priority - b.priority);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Convert to base64 for serverless GitHub upload
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove the data:image/...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      const base64Content = await base64Promise;

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Content,
          filename: file.name
        }),
      });
      const data = await res.json();
      if (data.url) {
        setValue('imageUrl', data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Upload Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: Make sure your local server is running (npm run dev).`);
    }
    setUploadingImage(false);
  };

  const onSubmit = async (data: Omit<Project, 'id'>) => {
    try {
      // Convert tags string to array if it's a string (from input)
      const formattedData = {
        ...data,
        tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map(t => t.trim()) : data.tags,
        priority: Number(data.priority) || 0
      };

      let newProjects = [...projects];

      if (editingId) {
        newProjects = newProjects.map(p => p.id === editingId ? { ...formattedData, id: editingId } : p);
      } else {
        newProjects.push({ ...formattedData, id: Date.now().toString() });
      }

      await fetch(`${API_URL}/db/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjects)
      });

      setIsFormOpen(false);
      setEditingId(null);
      reset();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    reset({
      ...project,
      tags: project.tags.join(', ') as any // For the input field
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const newProjects = projects.filter(p => p.id !== id);
      await fetch(`${API_URL}/db/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjects)
      });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
            <span className="w-8 h-px bg-[#ff4d4d]/30" />
            REPOSITORY
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Project Management</h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Curate and manage your technical deployments.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingId(null);
              reset({ title: '', description: '', imageUrl: '', tags: [], githubUrl: '', liveUrl: '', status: 'Completed', priority: 0 });
              setIsFormOpen(true);
            }}
            className="group px-6 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 tracking-widest uppercase"
          >
            <Plus className="h-4 w-4" />
            Initialize Project
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d4d]/5 blur-[100px] pointer-events-none" />
          <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-8">
            {editingId ? 'Edit Configuration' : 'New Configuration'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-6">
              <div className="sm:col-span-4 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Title</label>
                <input type="text" {...register('title', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Status</label>
                <select {...register('status')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold appearance-none">
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                <textarea rows={3} {...register('description', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Project Visual</label>
                <div className="mt-2 flex flex-col sm:flex-row items-start gap-6">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="h-32 w-48 object-cover rounded-2xl border border-white/10" />
                  ) : (
                    <div className="h-32 w-48 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 font-mono text-[10px]">NO_IMAGE</div>
                  )}
                  <div className="flex flex-col gap-4 flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff4d4d]/10 file:text-[#ff4d4d] file:font-bold hover:file:bg-[#ff4d4d]/20 transition-all" />
                    {uploadingImage && <span className="text-[10px] font-mono text-[#ff4d4d] animate-pulse">UPLOADING_ASSETS...</span>}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Tags (Comma Separated)</label>
                <input type="text" {...register('tags' as any)} placeholder="React, TypeScript, Tailwind" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-800" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">GitHub Node</label>
                <input type="url" {...register('githubUrl')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Live Endpoint</label>
                <input type="url" {...register('liveUrl')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">System Priority</label>
                <input type="number" {...register('priority')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 text-zinc-500 text-xs font-bold hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all tracking-widest uppercase">
                Abort
              </button>
              <button type="submit" className="px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-bold rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 tracking-widest uppercase">
                Save Node
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="group bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:border-[#ff4d4d]/20 hover:shadow-[0_0_30px_rgba(255,77,77,0.05)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt="" className="h-20 w-32 object-cover rounded-xl border border-white/10 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-20 w-32 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-[#ff4d4d] transition-colors">{project.title}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff4d4d]/10 text-[#ff4d4d] uppercase">{project.status}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase">PRIORITY_{project.priority}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(project)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="p-20 text-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-dashed rounded-[40px]">
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Empty Repository. Initialize New Node.</p>
          </div>
        )}
      </div>
    </div>
  );
}
