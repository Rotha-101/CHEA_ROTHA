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

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading projects...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Projects</h1>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ title: '', description: '', imageUrl: '', tags: [], githubUrl: '', liveUrl: '', status: 'Completed', priority: 0 });
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Project
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Project' : 'New Project'}
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
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea rows={3} {...register('description', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Image</label>
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
                <input type="text" {...register('tags' as any)} placeholder="React, TypeScript, Tailwind" className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</label>
                <input type="url" {...register('githubUrl')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Live Demo URL</label>
                <input type="url" {...register('liveUrl')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority (lower is first)</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors">
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {projects.map((project) => (
            <li key={project.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt="" className="h-12 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-16 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{project.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.status} • Priority: {project.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(project)} className="p-2 text-zinc-400 hover:text-amber-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No projects found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
