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
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
            <span className="w-8 h-px bg-[#ff4d4d]/30" />
            ACADEMICS
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Academic Records</h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Manage your educational background and qualifications.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => { setEditingId(null); setPhotos([]); reset({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '', priority: 0 }); setIsFormOpen(true); }}
            className="group px-6 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 tracking-widest uppercase"
          >
            <Plus className="h-4 w-4" /> Initialize Entry
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-12 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d4d]/5 blur-[100px] pointer-events-none" />
          <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-8">
            {editingId ? 'Edit Configuration' : 'New Configuration'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Institution</label>
                <input type="text" {...register('institution', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Degree</label>
                <input type="text" {...register('degree', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Field of Study</label>
                <input type="text" {...register('field')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Display Priority</label>
                <input type="number" {...register('priority')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Start Date</label>
                <input type="text" placeholder="e.g., 2018" {...register('startDate', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">End Date</label>
                <input type="text" placeholder="e.g., 2022" {...register('endDate')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>
              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Description / Achievements</label>
                <textarea rows={4} {...register('description')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
              </div>

              {/* Photo Upload */}
              <div className="sm:col-span-6 space-y-4">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                  <Image className="w-3 h-3" /> Diplomas & Certifications (Optional)
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer px-6 py-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-[#ff4d4d]/40 text-zinc-500 hover:text-[#ff4d4d] transition-all text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Processing...' : 'Link Asset'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} disabled={uploading} />
                  </label>
                  {uploading && <span className="text-[10px] font-mono text-[#ff4d4d] animate-pulse">UPLOADING_ASSETS...</span>}
                </div>
                {photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-lg transition-all hover:scale-110">
                        <img src={url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <button type="button" onClick={() => removePhoto(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => { setIsFormOpen(false); setPhotos([]); }} className="px-6 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 text-zinc-500 text-xs font-bold hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all tracking-widest uppercase">
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
        {educationList.map((edu) => (
          <div key={edu.id} className="group bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:border-[#ff4d4d]/20 hover:shadow-[0_0_30px_rgba(255,77,77,0.05)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                {edu.photos?.length > 0 ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                    <img src={edu.photos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500">
                    <Users className="h-6 w-6" />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-[#ff4d4d] transition-colors">{edu.degree} in {edu.field}</h3>
                  <p className="text-sm font-mono font-bold text-[#ff4d4d] mt-1 uppercase tracking-tighter">{edu.institution}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff4d4d]/10 text-[#ff4d4d] uppercase">{edu.startDate} - {edu.endDate}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase">PRIORITY_{edu.priority}</span>
                    {edu.photos?.length > 0 && <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 uppercase">📷 {edu.photos.length} ASSETS</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(edu)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(edu.id)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {educationList.length === 0 && (
          <div className="p-20 text-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-dashed rounded-[40px]">
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">No academic records detected. Initialize New Entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
