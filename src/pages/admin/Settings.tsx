import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const API_URL = '/api';
import { Save, Download } from 'lucide-react';
import { analyticsService } from '../../lib/analytics';
import { useAuthStore } from '../../store/authStore';

interface SiteSettings {
  showAbout: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showGallery: boolean;
  showSkills: boolean;
  showBlog: boolean;
  showReferences: boolean;
  showContact: boolean;
  heroBackgroundImageUrl: string;
  siteLogoUrl: string;
  announcementText: string;
  showAnnouncementBar: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  footerText: string;
  maintenanceMode: boolean;
  primaryColor: string;
  secondaryColor: string;
  gmailUser: string;
  gmailPass: string;
  siteLogoText: string;
  experienceTitle: string;
  experienceSubtitle: string;
  educationTitle: string;
  educationSubtitle: string;
  projectsTitle: string;
  projectsSubtitle: string;
  skillsTitle: string;
  skillsSubtitle: string;
  blogTitle: string;
  blogSubtitle: string;
  referencesTitle: string;
  referencesSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  aboutTitle: string;
  aboutSubtitle: string;
}

export default function Settings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { register, handleSubmit, reset, getValues } = useForm<SiteSettings>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SiteSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
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

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const url = uploadData.url;

      const currentData = { ...getValues() };
      // @ts-ignore
      currentData[fieldName] = url;
      reset(currentData);
      alert(`${fieldName} uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_URL}/db/settings`);
        const data = await res.json();
        
        if (data && Object.keys(data).length > 0) {
          reset(data as SiteSettings);
        } else {
          reset({
            showAbout: true,
            showExperience: true,
            showProjects: true,
            showGallery: true,
            showSkills: true,
            showBlog: true,
            showReferences: true,
            showContact: true,
            heroBackgroundImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2048',
            footerText: 'Chea Rotha. All rights reserved.',
            maintenanceMode: false,
            primaryColor: '#fbbf24',
            siteLogoText: 'CR.',
            experienceTitle: 'Experience',
            experienceSubtitle: 'My professional journey and roles.',
            educationTitle: 'Education',
            educationSubtitle: 'Academic background and qualifications.',
            projectsTitle: 'Selected Works',
            projectsSubtitle: 'A showcase of my work in Data Science, Machine Learning, and Software Development.',
            skillsTitle: 'Technical Arsenal',
            skillsSubtitle: 'A curated selection of my professional skills and technologies.',
            blogTitle: 'Latest Articles',
            blogSubtitle: 'Thoughts, tutorials, and insights on software development.',
            referencesTitle: 'References',
            referencesSubtitle: 'Professional references and contact points.',
            contactSubtitle: 'Feel free to reach out for collaborations or just a friendly hello.',
            aboutTitle: 'About Me',
            aboutSubtitle: ''
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SiteSettings) => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/db/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings.');
    }
    setSaving(false);
  };

  const handleExport = async () => {
    if (!confirm('This will export all your website data (Posts, Projects, Skills, etc.) to a JSON file. Continue?')) return;
    setExporting(true);
    try {
      const collections = ['profile', 'projects', 'experience', 'education', 'skills', 'blog', 'references', 'settings'];
      const data: any = {};

      await Promise.all(collections.map(async (col) => {
        try {
          const res = await fetch(`${API_URL}/db/${col}`);
          data[col] = await res.json();
        } catch(e) {
          data[col] = [];
        }
      }));

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      await analyticsService.trackEvent('database_export', {
        userId: user?.uid || 'unknown',
        details: 'User exported a full database backup',
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export database.');
    }
    setExporting(false);
  };

  if (loading) return <div className="text-zinc-500 dark:text-zinc-400">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Website Customization</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 px-4 py-5 sm:rounded-xl sm:p-6 transition-colors">
        
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">Section Visibility</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Enable or disable sections on the public homepage.</p>
          
          <div className="mt-4 space-y-4">
            {['About', 'Experience', 'Projects', 'Gallery', 'Skills', 'Blog', 'References', 'Contact'].map((section) => (
              <div key={section} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`show${section}`}
                    type="checkbox"
                    {...register(`show${section}` as keyof SiteSettings)}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-zinc-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`show${section}`} className="font-medium text-zinc-700 dark:text-zinc-300">
                    Show {section} Section
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">Appearance</h3>
          
          <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hero Background Image URL</label>
              <input type="text" {...register('heroBackgroundImageUrl')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              <p className="mt-2 text-xs text-zinc-500">Provide an Unsplash URL or any direct image link.</p>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Site Logo URL</label>
              <input type="text" {...register('siteLogoUrl')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              <p className="mt-2 text-xs text-zinc-500">Optional logo image for the site header.</p>
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Site Logo Text</label>
              <input type="text" {...register('siteLogoText')} placeholder="e.g. CR." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              <p className="mt-2 text-xs text-zinc-500">The text displayed next to the robot animation (e.g., CR., RR.).</p>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Footer Text</label>
              <input type="text" {...register('footerText')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Announcement Text</label>
              <input type="text" {...register('announcementText')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <div className="sm:col-span-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" {...register('showAnnouncementBar')} className="h-4 w-4 text-amber-600 border-zinc-300 rounded" />
                Show announcement bar
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Brand Primary Color</label>
              <input type="color" {...register('primaryColor')} className="mt-1 block w-full h-10 p-1 rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Brand Secondary Color</label>
              <input type="color" {...register('secondaryColor')} className="mt-1 block w-full h-10 p-1 rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">Section Titles & Subtitles</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Customize the headers for each part of your website.</p>
          
          <div className="mt-6 space-y-8">
            {[
              { id: 'about', label: 'About' },
              { id: 'experience', label: 'Experience' },
              { id: 'education', label: 'Education' },
              { id: 'projects', label: 'Projects' },
              { id: 'skills', label: 'Skills' },
              { id: 'blog', label: 'Blog' },
              { id: 'references', label: 'References' },
              { id: 'contact', label: 'Contact' }
            ].map((section) => (
              <div key={section.id} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">{section.label} Title</label>
                  <input type="text" {...register(`${section.id}Title` as keyof SiteSettings)} className="block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">{section.label} Subtitle</label>
                  <input type="text" {...register(`${section.id}Subtitle` as keyof SiteSettings)} className="block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">Hero Content</h3>
          <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hero Headline</label>
              <input type="text" {...register('heroHeadline')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hero Subheadline</label>
              <input type="text" {...register('heroSubheadline')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">CTA Label</label>
              <input type="text" {...register('heroCtaLabel')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">CTA URL</label>
              <input type="text" {...register('heroCtaUrl')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">📧 Email Settings (Gmail)</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Used to send contact form messages to your email. Use a <strong>Gmail App Password</strong>{' '}
            (not your regular password).{' '}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-amber-600 underline">Generate one here →</a>
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Gmail Address</label>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                {...register('gmailUser')}
                className="mt-1 block w-full text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Gmail App Password</label>
              <input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                {...register('gmailPass')}
                className="mt-1 block w-full text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-white">System Controls</h3>
          <div className="mt-4 flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Maintenance Mode</h4>
              <p className="text-xs text-red-600 dark:text-red-500/80">When enabled, public visitors will see a maintenance message.</p>
            </div>
            <div className="flex items-center h-5">
              <input
                id="maintenanceMode"
                type="checkbox"
                {...register('maintenanceMode')}
                className="focus:ring-red-500 h-6 w-6 text-red-600 border-zinc-300 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-between items-center bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 sticky bottom-0 z-10 transition-colors">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <Download className="-ml-1 mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export Backup'}
            </button>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-zinc-950 bg-amber-400 hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            <Save className="-ml-1 mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
