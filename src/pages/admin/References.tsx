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
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage References</h1>
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
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Reference
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Reference' : 'New Reference'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Circle Image</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full border-2 border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center cursor-pointer text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Best with square images (1:1).</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input type="text" {...register('name', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role / Title</label>
                <input type="text" {...register('title', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea rows={4} {...register('description')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

                <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
                <input type="text" {...register('phone')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input type="email" {...register('email')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Link</label>
                <input type="url" {...register('profileUrl')} placeholder="https://example.com/profile" className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Add a public profile or reference link so visitors can jump directly to their page.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors">
                Save Reference
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {references.map((item) => (
            <li key={item.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    {item.profileImageUrl ? (
                      <img src={item.profileImageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-400">
                        <UserRound className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{item.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{item.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 text-zinc-400 hover:text-amber-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {references.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No references found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
