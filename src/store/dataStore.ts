import { create } from 'zustand';
import staticDbRaw from '../../db.json';

const API_URL = '/api';
const REQUEST_TIMEOUT_MS = 6000;
const STATIC_JSON_URL = `${import.meta.env.BASE_URL}db.json`;
const NORMALIZED_BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

async function fetchJsonWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}) for ${url}`);
    }
    return await res.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function normalizeAssetUrl(value: string) {
  if (value.startsWith('http://localhost:3001/uploads/')) {
    return `${NORMALIZED_BASE_URL}uploads/${value.split('/uploads/')[1]}`;
  }

  if (value.startsWith('/uploads/')) {
    return `${NORMALIZED_BASE_URL}${value.replace(/^\//, '')}`;
  }

  return value;
}

function normalizeUploads<T>(value: T): T {
  if (typeof value === 'string') {
    return normalizeAssetUrl(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeUploads(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [key, normalizeUploads(entryValue)])
    ) as T;
  }

  return value;
}

async function fetchCollection(collection: string) {
  try {
    const data = await fetchJsonWithTimeout(`${API_URL}/db/${collection}`);
    return normalizeUploads(data);
  } catch (apiError) {
    console.warn(`API request for "${collection}" failed. Falling back to static db.json.`, apiError);
    try {
      const staticData = await fetchJsonWithTimeout(STATIC_JSON_URL);
      return normalizeUploads(staticData?.[collection]);
    } catch (staticError) {
      console.error(`Static fallback for "${collection}" failed.`, staticError);
      throw apiError;
    }
  }
}

interface Profile {
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

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  status: string;
  priority: number;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  priority: number;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  priority: number;
}

interface Reference {
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

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
}

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
}

interface DataState {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  references: Reference[];
  blog: BlogPost[];
  settings: SiteSettings | null;
  
  profileLoaded: boolean;
  projectsLoaded: boolean;
  experienceLoaded: boolean;
  blogLoaded: boolean;
  settingsLoaded: boolean;

  setProfile: (profile: Profile | null) => void;
  fetchProfileAndSkills: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchExperienceAndEducation: () => Promise<void>;
  fetchBlog: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  profile: normalizeUploads(staticDbRaw.profile) as Profile,
  skills: normalizeUploads(staticDbRaw.skills || []) as Skill[],
  projects: normalizeUploads(staticDbRaw.projects || []) as Project[],
  experience: normalizeUploads(staticDbRaw.experience || []) as Experience[],
  education: normalizeUploads(staticDbRaw.education || []) as Education[],
  references: normalizeUploads(staticDbRaw.references || []) as Reference[],
  blog: normalizeUploads(staticDbRaw.blog || []) as BlogPost[],
  settings: normalizeUploads(staticDbRaw.settings) as SiteSettings,
  
  profileLoaded: true,
  projectsLoaded: true,
  experienceLoaded: true,
  blogLoaded: true,
  settingsLoaded: true,

  setProfile: (profile) => set({
    profile,
    profileLoaded: true,
  }),

  fetchProfileAndSkills: async () => {
    if (get().profileLoaded) return;
    
    try {
      const [profileData, skillsData, referencesData] = await Promise.all([
        fetchCollection('profile'),
        fetchCollection('skills'),
        fetchCollection('references')
      ]);
      
      set({ 
        profile: profileData && Object.keys(profileData).length ? profileData : null, 
        skills: Array.isArray(skillsData) ? skillsData : [], 
        references: Array.isArray(referencesData) ? referencesData : [],
        profileLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({
        profile: null,
        skills: [],
        references: [],
        profileLoaded: true,
      });
    }
  },

  fetchProjects: async () => {
    if (get().projectsLoaded) return;
    
    try {
      const projectsData = await fetchCollection('projects');
      set({ 
        projects: Array.isArray(projectsData) ? projectsData : [], 
        projectsLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      set({
        projects: [],
        projectsLoaded: true,
      });
    }
  },

  fetchExperienceAndEducation: async () => {
    if (get().experienceLoaded) return;
    
    try {
      const [expData, eduData] = await Promise.all([
        fetchCollection('experience'),
        fetchCollection('education')
      ]);
      
      set({ 
        experience: Array.isArray(expData) ? expData : [], 
        education: Array.isArray(eduData) ? eduData : [], 
        experienceLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching experience:", error);
      set({
        experience: [],
        education: [],
        experienceLoaded: true,
      });
    }
  },

  fetchBlog: async () => {
    if (get().blogLoaded) return;
    
    try {
      const blogData = await fetchCollection('blog');
      set({ 
        blog: Array.isArray(blogData) ? blogData : [], 
        blogLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching blog:", error);
      set({
        blog: [],
        blogLoaded: true,
      });
    }
  },

  fetchSettings: async () => {
    if (get().settingsLoaded) return;
    try {
      const settingsData = await fetchCollection('settings');
      if (Object.keys(settingsData || {}).length > 0) {
        set({ settings: settingsData as SiteSettings, settingsLoaded: true });
      } else {
        // Default settings if none exist
        set({
          settings: {
            showAbout: true,
            showExperience: true,
            showProjects: true,
            showGallery: true,
            showSkills: true,
            showBlog: true,
            showReferences: true,
            showContact: true,
            heroBackgroundImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2048',
            siteLogoUrl: '',
            announcementText: 'Welcome to the enhanced portfolio experience — now with custom hero CTA and navigation.',
            showAnnouncementBar: true,
            heroHeadline: 'Engineering modern digital experiences',
            heroSubheadline: 'Building polished websites with rich features, performance, and reliability.',
            heroCtaLabel: 'Explore Work',
            heroCtaUrl: '#projects',
            footerText: 'Chea Rotha. All rights reserved.',
            maintenanceMode: false,
            primaryColor: '#fbbf24',
            secondaryColor: '#38bdf8'
          },
          settingsLoaded: true
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      set({
        settings: {
          showAbout: true,
          showExperience: true,
          showProjects: true,
          showGallery: true,
          showSkills: true,
          showBlog: true,
          showReferences: true,
          showContact: true,
          heroBackgroundImageUrl: '',
          siteLogoUrl: '',
          announcementText: 'Welcome to the enhanced portfolio experience — now with custom hero CTA and navigation.',
          showAnnouncementBar: true,
          heroHeadline: 'Engineering modern digital experiences',
          heroSubheadline: 'Building polished websites with rich features, performance, and reliability.',
          heroCtaLabel: 'Explore Work',
          heroCtaUrl: '#projects',
          footerText: 'Chea Rotha. All rights reserved.',
          maintenanceMode: false,
          primaryColor: '#fbbf24',
          secondaryColor: '#38bdf8'
        },
        settingsLoaded: true
      });
    }
  }
}));
