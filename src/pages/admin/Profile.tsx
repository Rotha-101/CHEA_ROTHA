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
  cvUrl?: string;
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
      alert('Profile updated successfully!');
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
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload API failed (${uploadRes.status})`);
      }
      const uploadData = await uploadRes.json();
      if (!uploadData?.url) {
        throw new Error('Upload did not return a file URL.');
      }
      const url = uploadData.url;
      
      // Update the form data and save to firestore immediately for the file
      const currentData = { ...getValues() };
      currentData[fieldName] = url;
      reset(currentData);
      
      await fetch(`${API_URL}/db/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
      setProfile(currentData);
      alert(`${fieldName} uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      alert(`Failed to upload ${fieldName}. Make sure the backend server is running on port 3001.`);
    }
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Edit Profile</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 py-5 sm:rounded-xl sm:p-6 transition-colors">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6 border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-2">
            <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">Media & Assets</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Upload your profile photo, cover image, and resume.</p>
            
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 min-w-0 flex flex-col gap-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Photo</label>
                <div className="mt-1 flex flex-col gap-3 min-w-0">
                  {getValues('profilePhotoUrl') && (
                    <img src={getValues('profilePhotoUrl')} alt="Profile" className="h-20 w-20 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')}
                    className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:mb-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 min-w-0 flex flex-col gap-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Cover Image</label>
                <div className="mt-1 flex flex-col gap-3 min-w-0">
                  {getValues('coverImageUrl') && (
                    <img src={getValues('coverImageUrl')} alt="Cover" className="h-20 w-full object-cover rounded-md border border-zinc-300 dark:border-zinc-700" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                    className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:mb-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 min-w-0 flex flex-col gap-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">CV / Resume (PDF)</label>
                <div className="mt-1 flex flex-col gap-3 min-w-0">
                  {getValues('cvUrl') && (
                    <a
                      href={getValues('cvUrl')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      View Current CV
                    </a>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'cvUrl')}
                    className="block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:mb-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
            <div className="mt-1">
              <input type="text" id="name" {...register('name')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Professional Title</label>
            <div className="mt-1">
              <input type="text" id="title" {...register('title')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Biography (Hero Section)</label>
            <div className="mt-1">
              <textarea id="bio" rows={5} {...register('bio')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full resize-y sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors leading-6" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="aboutMe" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">About Me</label>
            <div className="mt-1">
              <textarea
                id="aboutMe"
                rows={6}
                {...register('aboutMe')}
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full resize-y sm:text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors leading-6"
                placeholder="Write the full About Me text for the About section."
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
            <div className="mt-1">
              <input type="email" id="email" {...register('email')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
            <div className="mt-1">
              <input type="text" id="phone" {...register('phone')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Location</label>
            <div className="mt-1">
              <input type="text" id="location" {...register('location')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="github" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub URL</label>
            <div className="mt-1">
              <input type="url" id="github" {...register('github')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">LinkedIn URL</label>
            <div className="mt-1">
              <input type="url" id="linkedin" {...register('linkedin')} className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-zinc-950 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
