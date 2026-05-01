import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const API_URL = '/api';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  priority: number;
  iconUrl?: string;
  description?: string;
  yearsOfExperience?: number;
  isHighlighted?: boolean;
  certificationUrl?: string;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryOrderList, setCategoryOrderList] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategories, setSavingCategories] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const { register, handleSubmit, reset, setValue, watch } = useForm<Omit<Skill, 'id'>>();
  const iconUrl = watch('iconUrl');

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/db/skills`);
      let data = await res.json();
      data = Array.isArray(data) ? data : [];
      data.sort((a: any, b: any) => a.priority - b.priority);
      setSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
    setLoading(false);
  };

  const fetchCategoryOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/db/settings`);
      const settings = await res.json();
      if (settings.skillCategoryOrder && Array.isArray(settings.skillCategoryOrder)) {
        setCategoryOrderList(settings.skillCategoryOrder);
      } else {
        setCategoryOrderList([
          'IDE & Editors',
          'Programming Languages',
          'Data Wrangling & EDA',
          'Machine Learning',
          'Time Series Forecasting',
          'Deep Learning & AI',
          'NLP',
          'Cloud & MLOps',
          'Data Engineering',
          'Experiment Tracking & Model Management',
          'Statistics & Math',
          'Data Visualization',
          'Databases',
          'Core Strengths'
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveCategoryOrder = async () => {
    setSavingCategories(true);
    try {
      const res = await fetch(`${API_URL}/db/settings`);
      const settings = await res.json();
      
      settings.skillCategoryOrder = categoryOrderList;

      await fetch(`${API_URL}/db/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setIsCategoryModalOpen(false);
    } catch (e) {
      alert("Failed to save category order.");
    }
    setSavingCategories(false);
  };

  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    const newList = [...categoryOrderList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setCategoryOrderList(newList);
  };

  const moveCategoryDown = (index: number) => {
    if (index === categoryOrderList.length - 1) return;
    const newList = [...categoryOrderList];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setCategoryOrderList(newList);
  };

  const removeCategory = (index: number) => {
    const newList = [...categoryOrderList];
    newList.splice(index, 1);
    setCategoryOrderList(newList);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategoryOrderList([...categoryOrderList, newCategoryName.trim()]);
      setNewCategoryName("");
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCategoryOrder();
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
        setValue('iconUrl', data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Upload Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: Make sure your local server is running (npm run dev).`);
    }
    setUploadingImage(false);
  };

  const onSubmit = async (data: Omit<Skill, 'id'>) => {
    try {
      const formattedData = {
        ...data,
        level: Number(data.level),
        priority: Number(data.priority) || 0,
        yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined,
      };

      let newSkills = [...skills];
      if (editingId) {
        newSkills = newSkills.map(s => s.id === editingId ? { ...formattedData, id: editingId } : s);
      } else {
        newSkills.push({ ...formattedData, id: Date.now().toString() });
      }

      await fetch(`${API_URL}/db/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkills)
      });

      setIsFormOpen(false);
      setEditingId(null);
      reset();
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      alert(`Failed to save skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    reset(skill);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      const newSkills = skills.filter(s => s.id !== id);
      await fetch(`${API_URL}/db/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkills)
      });
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Failed to delete skill.");
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading skills...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Skills</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
          >
            Category Order
          </button>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
          >
            <option value="All">All Categories</option>
            {categoryOrderList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingId(null);
              reset({ name: '', level: 50, category: 'Frontend', priority: 0 });
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Skill
          </button>
        </div>
      </div>

      {isCategoryModalOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
            Manage Category Order
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Use the arrows to reorder categories, or add a new category to the list. This controls the order they appear on your public Skills page.
          </p>
          
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg max-h-[400px] overflow-y-auto mb-4 bg-zinc-50/50 dark:bg-zinc-950/20">
            {categoryOrderList.map((cat, index) => (
              <li key={cat} className="p-3 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat}</span>
                <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveCategoryUp(index)} disabled={index === 0} className="p-1.5 text-zinc-400 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => moveCategoryDown(index)} disabled={index === categoryOrderList.length - 1} className="p-1.5 text-zinc-400 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-zinc-400 cursor-pointer disabled:cursor-not-allowed">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => removeCategory(index)} className="p-1.5 text-zinc-400 hover:text-red-500 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
            {categoryOrderList.length === 0 && (
              <li className="p-4 text-center text-sm text-zinc-500">No categories found.</li>
            )}
          </ul>
          
          <div className="flex gap-3 mb-6">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              placeholder="Enter new category name..." 
              className="flex-1 sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" 
            />
            <button type="button" onClick={addCategory} className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Add Category
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={saveCategoryOrder} disabled={savingCategories} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors disabled:opacity-50">
              {savingCategories ? 'Saving...' : 'Save Category Order'}
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
            {editingId ? 'Edit Skill' : 'New Skill'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Skill Name</label>
                <input type="text" {...register('name', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                <select {...register('category', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500">
                  <option value="">Select a category</option>
                  {categoryOrderList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Proficiency Level (0-100)</label>
                <input type="number" min="0" max="100" {...register('level', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority (lower is first)</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description / Custom Blurb</label>
                <textarea rows={2} {...register('description')} placeholder="A brief description of how you use this skill..." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Years of Experience</label>
                <input type="number" step="0.5" min="0" {...register('yearsOfExperience')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Certification URL (Optional)</label>
                <input type="url" {...register('certificationUrl')} placeholder="https://..." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6 flex items-center">
                <input type="checkbox" id="isHighlighted" {...register('isHighlighted')} className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-zinc-300 rounded" />
                <label htmlFor="isHighlighted" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Highlight this skill (shows special glow/badge on the public page)
                </label>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Skill Icon</label>
                <div className="mt-2 flex items-center gap-4">
                  {iconUrl && (
                    <img src={iconUrl} alt="Preview" className="h-12 w-12 object-contain rounded-md border border-zinc-200 dark:border-zinc-700" />
                  )}
                  <div className="flex flex-col gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400" />
                    {uploadingImage && <span className="text-xs text-amber-600">Uploading...</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors">
                Save Skill
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {skills
            .filter(s => filterCategory === "All" || s.category === filterCategory)
            .map((skill) => (
            <li key={skill.id} className="p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {skill.iconUrl ? (
                    <img src={skill.iconUrl} alt={skill.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-500">Icon</div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{skill.name} <span className="text-xs text-zinc-500 ml-2">({skill.category})</span></h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{skill.level}% • Priority: {skill.priority}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(skill)} className="p-2 text-zinc-400 hover:text-amber-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(skill.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {skills.length === 0 && (
            <li className="p-6 text-center text-zinc-500 dark:text-zinc-400">No skills found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
