import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useDataStore } from '../../store/dataStore';

const API_URL = '/api';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Check, X } from 'lucide-react';

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
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategories, setSavingCategories] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [toast, setToast] = useState<string | null>(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState("");
  const [hasSkillsModified, setHasSkillsModified] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

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
        // Deduplicate the list to prevent visuals like the one reported
        const unique = Array.from(new Set(settings.skillCategoryOrder.map(c => c.trim())));
        setCategoryOrderList(unique);
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
      if (settings.disabledSkillCategories && Array.isArray(settings.disabledSkillCategories)) {
        setDisabledCategories(settings.disabledSkillCategories);
      }
    } catch (e) {
      console.error(e);
    }
  };

    const toggleCategory = async (cat: string) => {
    const newDisabled = disabledCategories.includes(cat)
      ? disabledCategories.filter(c => c !== cat)
      : [...disabledCategories, cat];
    setDisabledCategories(newDisabled);
    try {
      const res = await fetch(`${API_URL}/db/settings`);
      const current = await res.json();
      current.disabledSkillCategories = newDisabled;
      await fetch(`${API_URL}/db/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current)
      });
      useDataStore.getState().resetSyncFlags();
      const msg = newDisabled.includes(cat)
        ? '"' + cat + '" hidden from public page'
        : '"' + cat + '" now visible on public page';
      showToast(msg);
    } catch {
      showToast('Save failed - try again');
      setDisabledCategories(disabledCategories);
    }
  };

  const saveCategoryOrder = async () => {
    setSavingCategories(true);
    try {
      const res = await fetch(`${API_URL}/db/settings`);
      const settings = await res.json();
      
      settings.skillCategoryOrder = categoryOrderList;
      settings.disabledSkillCategories = disabledCategories;

      await fetch(`${API_URL}/db/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      // Save skills if modified by a rename
      if (hasSkillsModified) {
        await fetch(`${API_URL}/db/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skills)
        });
        setHasSkillsModified(false);
      }

      useDataStore.getState().resetSyncFlags();
      setIsCategoryModalOpen(false);
      showToast('Category settings saved!');
    } catch (e) {
      alert("Failed to save category order.");
    }
    setSavingCategories(false);
  };

  const startRenamingCategory = (index: number, name: string) => {
    setEditingCategoryIndex(index);
    setTempCategoryName(name);
  };

  const finishRenamingCategory = (index: number) => {
    const oldName = categoryOrderList[index];
    const newName = tempCategoryName.trim();
    
    if (!newName || oldName === newName) {
      setEditingCategoryIndex(null);
      return;
    }

    // Duplicate Check
    const exists = categoryOrderList.some((c, i) => i !== index && c.trim().toLowerCase() === newName.toLowerCase());
    if (exists) {
      showToast(`Category "${newName}" already exists.`);
      return;
    }

    // Update order list
    const newList = [...categoryOrderList];
    newList[index] = newName;
    setCategoryOrderList(newList);

    // Update disabled list
    if (disabledCategories.includes(oldName)) {
      setDisabledCategories(disabledCategories.map(c => c === oldName ? newName : c));
    }

    // Update skills locally
    const updatedSkills = skills.map(s => 
      s.category.trim().toLowerCase() === oldName.trim().toLowerCase() 
        ? { ...s, category: newName } 
        : s
    );
    setSkills(updatedSkills);
    setHasSkillsModified(true);

    setEditingCategoryIndex(null);
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
    const catToRemove = categoryOrderList[index];
    const isUsed = skills.some(s => s.category.trim().toLowerCase() === catToRemove.trim().toLowerCase());
    if (isUsed) {
      alert(`Cannot remove "${catToRemove}" because it is currently assigned to one or more skills. Please reassign those skills first, or use the toggle switch to hide it from the public page.`);
      return;
    }
    const newList = [...categoryOrderList];
    newList.splice(index, 1);
    setCategoryOrderList(newList);
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const exists = categoryOrderList.some(c => c.trim().toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        showToast(`Category "${trimmed}" already exists.`);
        return;
      }
      setCategoryOrderList([...categoryOrderList, trimmed]);
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

      useDataStore.getState().resetSyncFlags();
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
      useDataStore.getState().resetSyncFlags();
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Failed to delete skill.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl bg-[#ff4d4d] text-white text-[10px] font-mono font-bold tracking-widest shadow-[0_0_30px_rgba(255,77,77,0.3)] animate-in slide-in-from-top uppercase">
          {toast}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
            <span className="w-8 h-px bg-[#ff4d4d]/30" />
            ARSENAL
          </div>
          <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">Skill Matrix</h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">Inventory and proficiency management.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="px-5 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white text-[10px] font-bold rounded-2xl transition-all tracking-widest uppercase"
            onClick={() => {
              const list = [...categoryOrderList];
              let changed = false;
              const existing = new Set(list.map(c => c.trim().toLowerCase()));
              skills.forEach(skill => {
                const cat = skill.category.trim();
                if (!existing.has(cat.toLowerCase())) {
                  list.push(cat);
                  existing.add(cat.toLowerCase());
                  changed = true;
                }
              });
              if (changed) setCategoryOrderList(list);
              setIsCategoryModalOpen(true);
            }}
          >
            Categories
          </button>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-5 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white text-[10px] font-bold rounded-2xl transition-all tracking-widest uppercase outline-none appearance-none cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-[#0a0a0a]">Filter: All</option>
            {categoryOrderList.map(cat => (
              <option key={cat} value={cat} className="bg-white dark:bg-[#0a0a0a]">{cat}</option>
            ))}
          </select>

          <button
            type="button"
            className="px-5 py-3 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-[10px] font-bold rounded-2xl transition-all shadow-xl tracking-widest uppercase"
            onClick={() => {
              setEditingId(null);
              reset({ name: '', level: 50, category: 'Frontend', priority: 0 });
              setIsFormOpen(true);
            }}
          >
            Add Skill
          </button>
        </div>
      </div>

      {isCategoryModalOpen && (
        <div className="mb-12 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">Category Orchestrator</h2>
          <p className="text-sm text-zinc-500 font-medium mb-10">Define the hierarchy and visibility of your tech stack.</p>
          
          <ul className="divide-y divide-zinc-200 dark:divide-white/5 border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white/50 dark:bg-black/20 mb-8">
            {categoryOrderList.map((cat, index) => {
              const isDisabled = disabledCategories.includes(cat);
              const isEditing = editingCategoryIndex === index;
              return (
              <li key={cat} className={`p-4 flex items-center justify-between transition-all group ${isDisabled ? 'opacity-40' : 'hover:bg-white/[0.02]'}`}>
                <div className="flex items-center gap-6 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${
                      isDisabled ? 'bg-zinc-800' : 'bg-[#ff4d4d]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${isDisabled ? 'translate-x-1' : 'translate-x-6'}`} />
                  </button>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        type="text"
                        autoFocus
                        value={tempCategoryName}
                        onChange={(e) => setTempCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishRenamingCategory(index);
                          if (e.key === 'Escape') setEditingCategoryIndex(null);
                        }}
                        className="flex-1 bg-zinc-100 dark:bg-white/5 border border-[#ff4d4d]/30 rounded-xl px-3 py-1.5 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-[#ff4d4d]"
                      />
                      <button type="button" onClick={() => finishRenamingCategory(index)} className="p-1.5 bg-[#ff4d4d] text-white rounded-lg hover:bg-[#ff3333] transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingCategoryIndex(null)} className="p-1.5 bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{cat}</span>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startRenamingCategory(index, cat)} className="p-2 text-zinc-400 hover:text-[#ff4d4d] transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveCategoryUp(index)} disabled={index === 0} className="p-2 text-zinc-500 hover:text-[#ff4d4d] disabled:opacity-20">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveCategoryDown(index)} disabled={index === categoryOrderList.length - 1} className="p-2 text-zinc-500 hover:text-[#ff4d4d] disabled:opacity-20">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => removeCategory(index)} className="p-2 text-zinc-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
              );
            })}
          </ul>
          
          <div className="flex gap-4 mb-10">
            <input 
              type="text" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              placeholder="Inject new category identifier..." 
              className="flex-1 px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white text-sm outline-none font-bold"
            />
            <button type="button" onClick={addCategory} className="px-6 py-4 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-[10px] font-bold rounded-2xl transition-all tracking-widest uppercase">
              Add
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-zinc-200 dark:border-white/5">
            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-6 py-4 text-zinc-500 text-[10px] font-bold tracking-widest uppercase hover:text-zinc-900 dark:hover:text-white transition-all">
              Abort
            </button>
            <button type="button" onClick={saveCategoryOrder} disabled={savingCategories} className="px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-[10px] font-bold rounded-2xl transition-all tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95">
              {savingCategories ? 'SYNCING...' : 'COMMIT CHANGES'}
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="mb-12 bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-10">
            {editingId ? 'Modify Skill Node' : 'Initialize New Skill'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-6">
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Nomenclature</label>
                <input type="text" {...register('name', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Classification</label>
                <select {...register('category', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold appearance-none">
                  <option value="" className="bg-white dark:bg-[#0a0a0a]">Select Category</option>
                  {categoryOrderList.map(cat => (
                    <option key={cat} value={cat} className="bg-white dark:bg-[#0a0a0a]">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Proficiency (%)</label>
                <input type="number" min="0" max="100" {...register('level', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono font-bold" />
              </div>

              <div className="sm:col-span-3 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Priority Index</label>
                <input type="number" {...register('priority')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono font-bold" />
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Capability Description</label>
                <textarea rows={2} {...register('description')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Experience (Years)</label>
                <input type="number" step="0.5" min="0" {...register('yearsOfExperience')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono font-bold" />
              </div>

              <div className="sm:col-span-4 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Certification Uplink</label>
                <input type="url" {...register('certificationUrl')} placeholder="https://..." className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono font-bold" />
              </div>

              <div className="sm:col-span-6">
                <label className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" {...register('isHighlighted')} className="sr-only peer" />
                    <div className="w-10 h-6 bg-zinc-200 dark:bg-white/5 rounded-full border border-zinc-300 dark:border-white/10 peer-checked:bg-[#ff4d4d] transition-all" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Apply Highlight Radiation (Special Glow/Badge)</span>
                </label>
              </div>

              <div className="sm:col-span-6 space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Icon Visual</label>
                <div className="mt-2 flex items-center gap-6">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Preview" className="h-16 w-16 object-contain rounded-xl bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 p-3 shadow-inner" />
                  ) : (
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-500 font-mono text-[10px]">EMPTY</div>
                  )}
                  <div className="flex flex-col gap-4">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff4d4d]/10 file:text-[#ff4d4d] file:font-bold hover:file:bg-[#ff4d4d]/20 transition-all" />
                    {uploadingImage && <span className="text-[10px] font-mono text-[#ff4d4d] animate-pulse">UPLOADING...</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-200 dark:border-white/5">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 text-zinc-500 text-[10px] font-bold tracking-widest uppercase hover:text-zinc-900 dark:hover:text-white transition-all">
                Cancel
              </button>
              <button type="submit" className="px-8 py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-[10px] font-bold rounded-2xl transition-all tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95">
                Commit Skill
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {skills
          .filter(s => filterCategory === "All" || s.category === filterCategory)
          .map((skill) => (
          <div key={skill.id} className="group bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:border-[#ff4d4d]/20 hover:shadow-[0_0_30px_rgba(255,77,77,0.05)]">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-white/[0.02] rounded-xl border border-zinc-200 dark:border-white/5 group-hover:scale-110 transition-transform">
                  {skill.iconUrl ? (
                    <img src={skill.iconUrl} alt={skill.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="text-[10px] font-mono text-zinc-600">ID</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#ff4d4d] transition-colors">{skill.name}</h3>
                    <span className="px-2 py-0.5 bg-zinc-200 dark:bg-white/5 rounded text-[10px] font-mono text-zinc-500 font-bold">{skill.category}</span>
                    {skill.isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d] animate-pulse" />}
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ff4d4d]/40 to-[#ff4d4d] rounded-full shadow-[0_0_10px_rgba(255,77,77,0.3)]" style={{ width: `${skill.level}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">{skill.level}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(skill)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="p-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-red-500 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="p-20 text-center bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 border-dashed rounded-[40px]">
            <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Null Skillset Data. Inject Capability.</p>
          </div>
        )}
      </div>
    </div>
  );
}
