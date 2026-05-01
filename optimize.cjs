const fs = require('fs');
let content = fs.readFileSync('src/components/PublicLayout.tsx', 'utf8');

// Add useMemo to imports
content = content.replace(
  /import React, \{ useEffect, useState \} from 'react';/,
  "import React, { useEffect, useState, useMemo } from 'react';"
);

// Wrap navigation in useMemo
content = content.replace(
  /const navigation = \[\s*\{ name: 'Home'.*show: true \},\s*\{ name: 'About'.*show: settings\?\.showAbout !== false \},[\s\S]*?\]\.filter\(\(nav\) => nav\.show\);/,
  `const navigation = useMemo(() => [
    { name: 'Home', href: '#home', icon: Home, show: true },
    { name: 'About', href: '#about', icon: User, show: settings?.showAbout !== false },
    { name: 'Experience', href: '#experience', icon: Briefcase, show: settings?.showExperience !== false },
    { name: 'Education', href: '#education', icon: GraduationCap, show: settings?.showEducation !== false },
    { name: 'Projects', href: '#projects', icon: Folder, show: settings?.showProjects !== false },
    { name: 'Gallery', href: '#gallery', icon: Image, show: settings?.showGallery !== false },
    { name: 'Skills', href: '#skills', icon: Code2, show: settings?.showSkills !== false },
    { name: 'Blog', href: '#blog', icon: FileText, show: settings?.showBlog !== false },
    { name: 'Reference', href: '#reference', icon: Users, show: settings?.showReferences !== false },
    { name: 'Contact', href: '#contact', icon: MessageSquare, show: settings?.showContact !== false },
  ].filter((nav) => nav.show), [settings]);`
);

// Optimize scroll listener with requestAnimationFrame
content = content.replace(
  /const handleScroll = \(\) => \{[\s\S]*?setActiveSection\(currentSection\);\s*\};/,
  `let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = navigation.map((nav) => nav.href.substring(1));
          const scrollPosition = window.scrollY + SECTION_SCROLL_OFFSET + 10;
          let currentSection = sections[0] || 'home';

          for (const section of sections) {
            const element = document.getElementById(section);
            if (element && scrollPosition >= element.offsetTop) {
              currentSection = section;
            }
          }

          setActiveSection(currentSection);
          ticking = false;
        });
        ticking = true;
      }
    };`
);

fs.writeFileSync('src/components/PublicLayout.tsx', content);
console.log('optimized src/components/PublicLayout.tsx');
