/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { BackendStatus } from './components/BackendStatus';
import { useThemeStore } from './store/themeStore';
import { useDataStore } from './store/dataStore';
import { Helmet } from 'react-helmet-async';

// Public Pages
import Home from './pages/Home';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminProjects from './pages/admin/Projects';
import AdminExperience from './pages/admin/Experience';
import AdminEducation from './pages/admin/Education';
import AdminSkills from './pages/admin/Skills';
import AdminBlog from './pages/admin/Blog';
import AdminReferences from './pages/admin/References';
import AdminSettings from './pages/admin/Settings';
import AdminMediaLibrary from './pages/admin/MediaLibrary';
import AdminUsers from './pages/admin/Users';
import AdminActivityLogs from './pages/admin/ActivityLogs';

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  const { theme } = useThemeStore();
  const { settings } = useDataStore();
 
  useEffect(() => {
    // Theme Mode (Dark/Light)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Brand Color customization
    if (settings?.primaryColor) {
      document.documentElement.style.setProperty('--brand-color', settings.primaryColor);
      // Generate a slightly darker hover color (approximation)
      document.documentElement.style.setProperty('--brand-color-hover', `${settings.primaryColor}dd`);
    }
  }, [theme, settings?.primaryColor]);

  return (
    <BrowserRouter basename={routerBase}>
      <Helmet>
        <title>{settings?.footerText?.replace('. All rights reserved.', '') || 'Portfolio'}</title>
        <meta name="description" content="Professional Portfolio and Content Management System" />
      </Helmet>
      <BackendStatus />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="experience" element={<AdminExperience />} />
          <Route path="education" element={<AdminEducation />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="references" element={<AdminReferences />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="logs" element={<AdminActivityLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
