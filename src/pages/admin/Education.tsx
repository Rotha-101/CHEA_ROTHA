import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Upload, X, Image } from 'lucide-react';

const API_URL = '/api';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  priority: number;
  photos: string[];
}

export default function Education() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<Omit<Education, 'id' | 'photos'>>();

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/education`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: any, b: any) => a.priority - b.priority);
      setEducationList(data);
    } catch (error) {
      console.error('Error fetching education:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEducation(); }, []);

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

  const onSubmit = async (data: Omit<Education, 'id' | 'photos'>) => {
    try {
      const formattedData = {
        ...data,
        priority: Number(data.priority) || 0,
        photos,
      };
      let newList = [...educationList];
      if (editingId) {
        newList = newList.map(e => e.id === editingId ? { ...formattedData, id: editingId } : e);
      } else {
        newList.push({ ...formattedData, id: Date.now().toString() });
      }
      await fetch(`${API_URL}/db/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });
      setIsFormOpen(false);
      setEditingId(null);
      setPhotos([]);
      reset();
      fetchEducation();
    } catch (error) {
      console.error('Error saving education:', error);
      alert('Failed to save education.');
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    reset(edu);
    setPhotos(edu.photos || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    try {
      const newList = educationList.filter(e => e.id !== id);
      await fetch(`${API_URL}/db/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });
      fetchEducation();
    } catch (error) {
      alert('Failed to delete education.');
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading education...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Education</h1>
        <button
          onClick={() => { setEditingId(null); setPhotos([]); reset({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '', priority: 0 }); setIsFormOpen(true); }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-[#ff4d4d] hover:bg-[#ff4d4d] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Education
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Education' : 'New Education'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Institution</label>
                <input type="text" {...register('institution', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Degree</label>
                <input type="text" {...register('degree', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Field of Study</label>
                <input type="text" {...register('field')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
                <input type="text" placeholder="e.g., 2018" {...register('startDate', { required: true })} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
                <input type="text" placeholder="e.g., 2022" {...register('endDate')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description / Achievements</label>
                <textarea rows={4} {...register('description')} className="mt-1 block w-full sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-[#ff4d4d] focus:border-[#ff4d4d]" />
              </div>

              {/* Photo Upload */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" /> Photos (optional — multiple allowed)
                </label>
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff4d4d] text-zinc-600 dark:text-zinc-400 hover:text-[#ff4d4d] transition-colors text-sm">
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
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-[#ff4d4d] hover:bg-[#ff4d4d] transition-colors">Save Education</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {educationList.map((edu) => (
            <li key={edu.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {edu.photos?.length > 0 && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <img src={edu.photos[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{edu.degree} in {edu.field}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {edu.institution} • {edu.startDate} - {edu.endDate} • Priority: {edu.priority}
                      {edu.photos?.length > 0 && <span className="ml-2 text-[#ff4d4d]">📷 {edu.photos.length} photo{edu.photos.length > 1 ? 's' : ''}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(edu)} className="p-2 text-zinc-400 hover:text-[#ff4d4d] transition-colors"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(edu.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
          {educationList.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No education found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
