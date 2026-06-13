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
    const res = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store'
    });
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

const inFlightRequests: Record<string, Promise<any>> = {};

async function fetchCollection(collection: string) {
  if (inFlightRequests[collection]) {
    return inFlightRequests[collection];
  }

  const promise = (async () => {
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
    } finally {
      delete inFlightRequests[collection];
    }
  })();

  inFlightRequests[collection] = promise;
  return promise;
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
  discord?: string;
  threads?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  profilePhotoUrl?: string;
  coverImageUrl?: string;
  cvUrl?: string;
  aboutSectionCoverUrl?: string;
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
  siteLogoText: string;
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
  siteLogoText: string;
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
  aboutSubtitle: string;
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

  // Background sync tracking flags
  hasFetchedProfile: boolean;
  hasFetchedProjects: boolean;
  hasFetchedExperience: boolean;
  hasFetchedBlog: boolean;
  hasFetchedSettings: boolean;

  setProfile: (profile: Profile | null) => void;
  fetchProfileAndSkills: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchExperienceAndEducation: () => Promise<void>;
  fetchBlog: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  resetSyncFlags: () => void;
}

const isDbPopulated = !!(staticDbRaw && staticDbRaw.profile && Object.keys(staticDbRaw.profile).length > 0);

export const useDataStore = create<DataState>((set, get) => ({
  profile: normalizeUploads({
    ...staticDbRaw.profile,
    aboutSectionCoverUrl: staticDbRaw.profile?.aboutSectionCoverUrl || ''
  }) as Profile,
  skills: normalizeUploads(staticDbRaw.skills || []) as Skill[],
  projects: normalizeUploads(staticDbRaw.projects || []) as Project[],
  experience: normalizeUploads(staticDbRaw.experience || []) as Experience[],
  education: normalizeUploads(staticDbRaw.education || []) as Education[],
  references: normalizeUploads(staticDbRaw.references || []) as Reference[],
  blog: normalizeUploads(staticDbRaw.blog || []) as BlogPost[],
  settings: normalizeUploads({
    ...staticDbRaw.settings,
    siteLogoText: staticDbRaw.settings?.siteLogoText || 'CR'
  }) as SiteSettings,
  
  profileLoaded: isDbPopulated,
  projectsLoaded: isDbPopulated,
  experienceLoaded: isDbPopulated,
  blogLoaded: isDbPopulated,
  settingsLoaded: isDbPopulated,

  // Background sync tracking flags initialization
  hasFetchedProfile: false,
  hasFetchedProjects: false,
  hasFetchedExperience: false,
  hasFetchedBlog: false,
  hasFetchedSettings: false,

  setProfile: (profile) => set({
    profile,
    profileLoaded: true,
    hasFetchedProfile: true,
  }),

  resetSyncFlags: () => set({
    hasFetchedProfile: false,
    hasFetchedProjects: false,
    hasFetchedExperience: false,
    hasFetchedBlog: false,
    hasFetchedSettings: false,
  }),

  fetchProfileAndSkills: async () => {
    if (get().hasFetchedProfile) return;
    set({ hasFetchedProfile: true });
    
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
      if (!get().profile) {
        set({
          profile: null,
          skills: [],
          references: [],
        });
      }
      set({ profileLoaded: true });
    }
  },

  fetchProjects: async () => {
    if (get().hasFetchedProjects) return;
    set({ hasFetchedProjects: true });
    
    try {
      const projectsData = await fetchCollection('projects');
      set({ 
        projects: Array.isArray(projectsData) ? projectsData : [], 
        projectsLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      if (!get().projects || get().projects.length === 0) {
        set({ projects: [] });
      }
      set({ projectsLoaded: true });
    }
  },

  fetchExperienceAndEducation: async () => {
    if (get().hasFetchedExperience) return;
    set({ hasFetchedExperience: true });
    
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
      if ((!get().experience || get().experience.length === 0) && (!get().education || get().education.length === 0)) {
        set({
          experience: [],
          education: [],
        });
      }
      set({ experienceLoaded: true });
    }
  },

  fetchBlog: async () => {
    if (get().hasFetchedBlog) return;
    set({ hasFetchedBlog: true });
    
    try {
      const blogData = await fetchCollection('blog');
      set({ 
        blog: Array.isArray(blogData) ? blogData : [], 
        blogLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching blog:", error);
      if (!get().blog || get().blog.length === 0) {
        set({ blog: [] });
      }
      set({ blogLoaded: true });
    }
  },

  fetchSettings: async () => {
    if (get().hasFetchedSettings) return;
    set({ hasFetchedSettings: true });
    try {
      const settingsData = await fetchCollection('settings');
      if (Object.keys(settingsData || {}).length > 0) {
        set({ settings: settingsData as SiteSettings, settingsLoaded: true });
      } else {
        if (!get().settings) {
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
              secondaryColor: '#38bdf8',
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
              contactTitle: 'Get in Touch',
              contactSubtitle: 'Feel free to reach out for collaborations or just a friendly hello.',
              aboutTitle: 'About Me',
              aboutSubtitle: ''
            }
          });
        }
        set({ settingsLoaded: true });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      if (!get().settings) {
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
            secondaryColor: '#38bdf8',
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
            contactTitle: 'Get in Touch',
            contactSubtitle: 'Feel free to reach out for collaborations or just a friendly hello.',
            aboutTitle: 'About Me',
            aboutSubtitle: ''
          }
        });
      }
      set({ settingsLoaded: true });
    }
  }
}));
