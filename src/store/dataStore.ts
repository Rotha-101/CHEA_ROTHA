import { create } from 'zustand';

const API_URL = '/api';
const REQUEST_TIMEOUT_MS = 6000;

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
  priority: number;
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
  settings: SiteSettings | null;
  
  profileLoaded: boolean;
  projectsLoaded: boolean;
  experienceLoaded: boolean;
  settingsLoaded: boolean;

  setProfile: (profile: Profile | null) => void;
  fetchProfileAndSkills: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchExperienceAndEducation: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  profile: null,
  skills: [],
  projects: [],
  experience: [],
  education: [],
  references: [],
  settings: null,
  
  profileLoaded: false,
  projectsLoaded: false,
  experienceLoaded: false,
  settingsLoaded: false,

  setProfile: (profile) => set({
    profile,
    profileLoaded: true,
  }),

  fetchProfileAndSkills: async () => {
    if (get().profileLoaded) return;
    
    try {
      const [profileData, skillsData, referencesData] = await Promise.all([
        fetchJsonWithTimeout(`${API_URL}/db/profile`),
        fetchJsonWithTimeout(`${API_URL}/db/skills`),
        fetchJsonWithTimeout(`${API_URL}/db/references`)
      ]);
      
      set({ 
        profile: Object.keys(profileData).length ? profileData : null, 
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
      const projectsData = await fetchJsonWithTimeout(`${API_URL}/db/projects`);
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
        fetchJsonWithTimeout(`${API_URL}/db/experience`),
        fetchJsonWithTimeout(`${API_URL}/db/education`)
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

  fetchSettings: async () => {
    if (get().settingsLoaded) return;
    try {
      const settingsData = await fetchJsonWithTimeout(`${API_URL}/db/settings`);
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
