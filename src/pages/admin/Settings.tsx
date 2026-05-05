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
            primaryColor: '#ff4d4d',
            siteLogoText: 'CR',
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
          CONFIGURATIONS
        </div>
        <h1 className="text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">System Parameters</h1>
        <p className="text-zinc-500 text-sm font-medium mt-2">Adjust the visual and functional parameters of the public terminal.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">Section Visibility</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">Enable or disable neural pathways on the interface.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['About', 'Experience', 'Projects', 'Gallery', 'Skills', 'Blog', 'References', 'Contact'].map((section) => (
              <label key={section} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 transition-all cursor-pointer group">
                <div className="relative flex items-center h-5">
                  <input
                    id={`show${section}`}
                    type="checkbox"
                    {...register(`show${section}` as keyof SiteSettings)}
                    className="appearance-none h-5 w-5 bg-zinc-200 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg checked:bg-[#ff4d4d] checked:border-[#ff4d4d] transition-all cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-has-[:checked]:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Show {section} Section</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">Visual Identity</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">Customize the aesthetic parameters and branding.</p>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Hero Background Source</label>
              <input type="text" {...register('heroBackgroundImageUrl')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 text-sm" />
            </div>

            <div className="sm:col-span-1 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Primary Brand Accent</label>
              <div className="flex items-center gap-4">
                <input type="color" {...register('primaryColor')} className="h-14 w-24 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-1 cursor-pointer" />
                <span className="text-xs font-mono text-zinc-500">{getValues('primaryColor')}</span>
              </div>
            </div>

            <div className="sm:col-span-1 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Secondary Accent</label>
              <div className="flex items-center gap-4">
                <input type="color" {...register('secondaryColor')} className="h-14 w-24 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-1 cursor-pointer" />
                <span className="text-xs font-mono text-zinc-500">{getValues('secondaryColor')}</span>
              </div>
            </div>
            
            <div className="sm:col-span-1 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Logo Signature</label>
              <input type="text" {...register('siteLogoText')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
            </div>

            <div className="sm:col-span-1 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Footer Copyright</label>
              <input type="text" {...register('footerText')} className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">Section Nomenclature</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">Override the default titles and subtitles for each section.</p>
          
          <div className="space-y-10">
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
              <div key={section.id} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">{section.label} Identifier</label>
                  <input type="text" {...register(`${section.id}Title` as keyof SiteSettings)} className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-1 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-bold" />
                </div>
                <div className="sm:col-span-1 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">{section.label} Descriptor</label>
                  <input type="text" {...register(`${section.id}Subtitle` as keyof SiteSettings)} className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-500 dark:text-zinc-400 focus:ring-1 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">Neural Link (Gmail)</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">Configure the bridge for incoming communications.</p>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Gateway Email</label>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                {...register('gmailUser')}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Security Token</label>
              <input
                type="password"
                placeholder="•••• •••• •••• ••••"
                {...register('gmailPass')}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-[#ff4d4d]/5 border border-[#ff4d4d]/10">
            <p className="text-[10px] font-mono font-bold text-[#ff4d4d] tracking-widest uppercase flex items-center gap-3">
              <Save className="w-4 h-4" />
              Use a Gmail App Password for secure access. 
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline ml-auto hover:text-white transition-colors">Generate Token →</a>
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-white/5 backdrop-blur-md border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-xl">
          <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-2">System Override</h3>
          <p className="text-sm text-zinc-500 font-medium mb-8">Execute low-level system commands.</p>
          
          <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <div>
              <h4 className="text-sm font-bold text-red-500 uppercase tracking-tight">Maintenance Protocol</h4>
              <p className="text-xs text-zinc-500 mt-1">Suspend public access and broadcast a offline status.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('maintenanceMode')}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white"></div>
            </label>
          </div>
        </div>

        <div className="flex gap-4 sticky bottom-8 z-20">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 py-5 bg-white dark:bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-[#ff4d4d]/30 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl tracking-widest uppercase"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'EXPORTING...' : 'BACKUP DATA'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] py-5 bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.01] active:scale-[0.99] tracking-widest uppercase"
          >
            <Save className="h-4 w-4" />
            {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
