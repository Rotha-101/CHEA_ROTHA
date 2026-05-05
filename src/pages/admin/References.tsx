import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit2, Plus, Trash2, Upload, UserRound } from 'lucide-react';

const API_URL = '/api';

interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  description: string;
  phone: string;
  email: string;
  profileImageUrl?: string;
  profileUrl?: string;
  priority: number;
}

export default function References() {
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<ReferenceItem, 'id'>>();
  const profileImageUrl = watch('profileImageUrl');

  const fetchReferences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/references`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: ReferenceItem, b: ReferenceItem) => (a.priority ?? 0) - (b.priority ?? 0));
      setReferences(data);
    } catch (error) {
      console.error('Error fetching references:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      setValue('profileImageUrl', data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile image.');
    }
    setUploadingImage(false);
  };

  const onSubmit = async (data: Omit<ReferenceItem, 'id'>) => {
    try {
      const formattedData: Omit<ReferenceItem, 'id'> = {
        ...data,
        priority: Number(data.priority) || 0,
        profileImageUrl: data.profileImageUrl || '',
      };

      let newReferences = [...references];
      if (editingId) {
        newReferences = newReferences.map((item) =>
          item.id === editingId ? { ...formattedData, id: editingId } : item
        );
      } else {
        newReferences.push({ ...formattedData, id: Date.now().toString() });
      }

      await fetch(`${API_URL}/db/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReferences),
      });

      setIsFormOpen(false);
      setEditingId(null);
      reset();
      fetchReferences();
    } catch (error) {
      console.error('Error saving reference:', error);
      alert('Failed to save reference.');
    }
  };

  const handleEdit = (item: ReferenceItem) => {
    setEditingId(item.id);
    reset(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reference?')) return;
    try {
      const newReferences = references.filter((item) => item.id !== id);
      await fetch(`${API_URL}/db/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReferences),
      });
      fetchReferences();
    } catch (error) {
      console.error('Error deleting reference:', error);
      alert('Failed to delete reference.');
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading references...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
            <span className="w-8 h-px bg-[#ff4d4d]/30" />
            VOUCHERS
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Professional Endorsements</h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Manage your network and professional references.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => {
              setEditingId(null);
              reset({
                name: '',
                title: '',
                description: '',
                phone: '',
                email: '',
                profileImageUrl: '',
                priority: 0,
              });
              setIsFormOpen(true);
            }}
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
              <div className="sm:col-span-6 space-y-4">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Profile Identifier (Circle)</label>
                <div className="mt-2 flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full border-4 border-zinc-200 dark:border-white/10 overflow-hidden bg-zinc-100 dark:bg-white/5 flex items-center justify-center shadow-xl group transition-transform hover:scale-105 duration-500">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Preview" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <UserRound className="w-10 h-10 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-[#ff4d4d]/40 text-zinc-500 hover:text-[#ff4d4d] transition-all text-[10px] font-mono font-bold uppercase tracking-widest">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Processing...' : 'Link Asset'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Recommended: Square 1:1 Aspect Ratio</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Name</label>
                <input type="text" {...register('name', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Role / Designation</label>
                <input type="text" {...register('title', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Vouch Statement</label>
                <textarea rows={4} {...register('description')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Phone Signal</label>
                <input type="text" {...register('phone')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Endpoint</label>
                <input type="email" {...register('email')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Digital Uplink (Profile URL)</label>
                <input type="url" {...register('profileUrl')} placeholder="https://..." className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Display Priority</label>
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
        {references.map((item) => (
          <div key={item.id} className="group bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:border-[#ff4d4d]/20 hover:shadow-[0_0_30px_rgba(255,77,77,0.05)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                  {item.profileImageUrl ? (
                    <img src={item.profileImageUrl} alt={item.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400">
                      <UserRound className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-[#ff4d4d] transition-colors truncate">{item.name}</h3>
                  <p className="text-sm font-mono font-bold text-[#ff4d4d] mt-1 uppercase tracking-tighter truncate">{item.title}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-500 uppercase tracking-widest">PRIORITY_{item.priority}</span>
                    {item.email && <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 uppercase tracking-widest truncate">{item.email}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(item)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-[#ff4d4d]/30 transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {references.length === 0 && (
          <div className="p-20 text-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-dashed rounded-[40px]">
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">No verified endorsements detected. Add one to build trust.</p>
          </div>
        )}
      </div>
    </div>
  );
}
