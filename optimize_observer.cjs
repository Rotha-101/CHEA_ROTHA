const fs = require('fs');
let content = fs.readFileSync('src/components/PublicLayout.tsx', 'utf8');

content = content.replace(
  /useEffect\(\(\) => \{\s*let ticking = false;[\s\S]*?return \(\) => window\.removeEventListener\('scroll', handleScroll\);\s*\}, \[navigation\]\);/,
  `useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        // 96px matches the SECTION_SCROLL_OFFSET, and we trigger when the top of the section hits the top 20% of viewport
        rootMargin: '-96px 0px -80% 0px',
        threshold: 0,
      }
    );

    const sections = navigation.map((nav) => nav.href.substring(1));
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [navigation]);`
);

fs.writeFileSync('src/components/PublicLayout.tsx', content);
console.log('optimized src/components/PublicLayout.tsx with IntersectionObserver');
