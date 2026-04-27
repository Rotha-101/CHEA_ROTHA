import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Upload, X, ChevronLeft, ChevronRight, Image } from 'lucide-react';

const API_URL = '/api';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  priority: number;
  photos: string[];
}

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<Omit<Experience, 'id' | 'photos'>>();
  const isCurrent = watch('current');

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/experience`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: any, b: any) => a.priority - b.priority);
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchExperiences(); }, []);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setPhotos(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removePhoto = (url: string) => setPhotos(prev => prev.filter(p => p !== url));

  const onSubmit = async (data: Omit<Experience, 'id' | 'photos'>) => {
    try {
      const formattedData = {
        ...data,
        priority: Number(data.priority) || 0,
        endDate: data.current ? 'Present' : data.endDate,
        photos,
      };
      let newExperiences = [...experiences];
      if (editingId) {
        newExperiences = newExperiences.map(e => e.id === editingId ? { ...formattedData, id: editingId } : e);
      } else {
        newExperiences.push({ ...formattedData, id: Date.now().toString() });
      }
      await fetch(`${API_URL}/db/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExperiences),
      });
      setIsFormOpen(false);
      setEditingId(null);
      setPhotos([]);
      reset();
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Failed to save experience.');
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    reset(exp);
    setPhotos(exp.photos || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const newExperiences = experiences.filter(e => e.id !== id);
      await fetch(`${API_URL}/db/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExperiences),
      });
      fetchExperiences();
    } catch (error) {
      alert('Failed to delete experience.');
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading experience...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Experience</h1>
        <button
          onClick={() => { setEditingId(null); setPhotos([]); reset({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '', priority: 0 }); setIsFormOpen(true); }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Experience
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Experience' : 'New Experience'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Job Title</label>
                <input type="text" {...register('title', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Company</label>
                <input type="text" {...register('company', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
                <input type="text" {...register('location')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
                <input type="text" placeholder="e.g., Jan 2020" {...register('startDate', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
                <input type="text" placeholder="e.g., Dec 2022" disabled={isCurrent} {...register('endDate')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50" />
              </div>
              <div className="sm:col-span-2 flex items-center mt-6">
                <input type="checkbox" id="current_exp" {...register('current')} className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 rounded" />
                <label htmlFor="current_exp" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">I currently work here</label>
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description / Responsibilities</label>
                <textarea rows={4} {...register('description', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500" />
              </div>

              {/* Photo Upload Section */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" /> Photos (optional — multiple allowed)
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} disabled={uploading} />
                </label>
                {photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setIsFormOpen(false); setPhotos([]); }} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors">Save Experience</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {experiences.map((exp) => (
            <li key={exp.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {exp.photos?.length > 0 && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <img src={exp.photos[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{exp.title} at {exp.company}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate} • Priority: {exp.priority}
                      {exp.photos?.length > 0 && <span className="ml-2 text-amber-500">📷 {exp.photos.length} photo{exp.photos.length > 1 ? 's' : ''}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(exp)} className="p-2 text-zinc-400 hover:text-amber-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(exp.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
          {experiences.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No experience found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
