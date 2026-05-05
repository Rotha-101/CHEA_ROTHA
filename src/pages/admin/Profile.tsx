import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDataStore } from '../../store/dataStore';

const API_URL = '/api';

interface ProfileForm {
  name: string;
  title: string;
  bio: string;
  aboutMe?: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  profilePhotoUrl?: string;
  coverImageUrl?: string;
  aboutSectionCoverUrl?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, getValues } = useForm<ProfileForm>();
  const setProfile = useDataStore((state) => state.setProfile);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/db/profile`);
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          const normalizedData = {
            ...data,
            aboutMe: data.aboutMe ?? data.bio ?? ''
          } as ProfileForm;
          reset(normalizedData);
          setProfile(normalizedData);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [reset, setProfile]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/db/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setProfile(data);
      alert('Profile updated successfully! Deployment sync may take a minute.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ProfileForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Content,
          filename: file.name
        }),
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed (${uploadRes.status})`);
      }
      const uploadData = await uploadRes.json();
      if (!uploadData?.url) {
        throw new Error('Upload did not return a file URL.');
      }
      const url = uploadData.url;

      // Update the form data
      const currentData = { ...getValues() };
      currentData[fieldName] = url;
      reset(currentData);

      const saveRes = await fetch(`${API_URL}/db/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Save failed (${saveRes.status})`);
      }

      setProfile(currentData);
      alert(`${fieldName} uploaded and saved to GitHub successfully!`);
    } catch (error: any) {
      console.error(`Error uploading ${fieldName}:`, error);
      alert(`Upload Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTip: Make sure your local server is running (npm run dev).`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-12">
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d] mb-3">
          <span className="w-8 h-px bg-[#ff4d4d]/30" />
          ENTITY PROFILE
        </div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Identity Management</h1>
        <p className="text-zinc-500 text-sm font-medium mt-2">Update your public persona and system identifiers.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-white mb-2">Media & Assets</h3>
          <p className="text-sm text-zinc-500 font-medium mb-10">Upload visual identifiers for your repository.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#ff4d4d]/20 transition-all flex flex-col gap-4">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Avatar</label>
              <div className="flex flex-col items-center gap-4">
                {getValues('profilePhotoUrl') ? (
                  <img src={getValues('profilePhotoUrl')} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-[#ff4d4d]/20 p-1" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">No Image</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')}
                  className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff4d4d]/10 file:text-[#ff4d4d] file:font-bold hover:file:bg-[#ff4d4d]/20 transition-all"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#ff4d4d]/20 transition-all flex flex-col gap-4">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Hero Background</label>
              <div className="flex flex-col gap-4">
                {getValues('coverImageUrl') ? (
                  <img src={getValues('coverImageUrl')} alt="Cover" className="h-24 w-full object-cover rounded-2xl border border-white/10" />
                ) : (
                  <div className="h-24 w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">No Image</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                  className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff4d4d]/10 file:text-[#ff4d4d] file:font-bold hover:file:bg-[#ff4d4d]/20 transition-all"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#ff4d4d]/20 transition-all flex flex-col gap-4">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Neural CV (PDF)</label>
              <div className="flex flex-col gap-4 justify-center flex-1">
                {getValues('cvUrl') && (
                  <a href={getValues('cvUrl')} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#ff4d4d] underline truncate">Current_Path_Active</a>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'cvUrl')}
                  className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#ff4d4d]/10 file:text-[#ff4d4d] file:font-bold hover:file:bg-[#ff4d4d]/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-white mb-2">Core Identity</h3>
          <p className="text-sm text-zinc-500 font-medium mb-10">Define your nomenclature and primary descriptors.</p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Assigned Name</label>
              <input type="text" {...register('name')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Functional Designation</label>
              <input type="text" {...register('title')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Terminal Bio (Short)</label>
              <textarea rows={4} {...register('bio')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Extended Narrative (About)</label>
              <textarea rows={8} {...register('aboutMe')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-white mb-2">Neural Linkage</h3>
          <p className="text-sm text-zinc-500 font-medium mb-10">Configure communication gateways and node coordinates.</p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Endpoint</label>
              <input type="email" {...register('email')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Voice Frequency</label>
              <input type="text" {...register('phone')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Geospatial Coordinates</label>
              <input type="text" {...register('location')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">GitHub Node</label>
              <input type="url" {...register('github')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">LinkedIn Uplink</label>
              <input type="url" {...register('linkedin')} className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-black/40 text-[#ff4d4d] focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono" />
            </div>
          </div>
        </div>

        <div className="flex sticky bottom-8 z-20">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 tracking-[0.2em] uppercase"
          >
            {saving ? 'UPDATING CORE...' : 'COMMIT PROFILE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
