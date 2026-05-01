const fs = require('fs');
let content = fs.readFileSync('src/pages/Skills.tsx', 'utf8');

// Replace blurb
content = content.replace(
  /\{getSkillBlurb\(skill\.name, skill\.category, level\)\}/g,
  `{skill.description || getSkillBlurb(skill.name, skill.category, level)}`
);

// Add years of experience
content = content.replace(
  /<p className="mt-1 text-\[11px\] sm:text-xs uppercase tracking-\[0\.14em\] text-zinc-500 dark:text-zinc-400 text-center line-clamp-1">\s*\{skill\.category\}\s*<\/p>/g,
  `<p className="mt-1 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 text-center line-clamp-1">
                          {skill.category} {skill.yearsOfExperience ? \`• \${skill.yearsOfExperience} YRS\` : ''}
                        </p>`
);

// Add highlight glow
content = content.replace(
  /className="group rounded-xl border border-white\/30 dark:border-zinc-700\/60 bg-white\/35 dark:bg-zinc-900\/45 backdrop-blur-xl p-3 sm:p-4 shadow-\[0_8px_24px_rgba\(0,0,0,0\.2\)\] hover:border-amber-400\/70 hover:-translate-y-0\.5 transition-all duration-300"/g,
  `className={\`group rounded-xl border backdrop-blur-xl p-3 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 \${
                        skill.isHighlighted 
                          ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400'
                          : 'border-white/30 dark:border-zinc-700/60 bg-white/35 dark:bg-zinc-900/45 hover:border-amber-400/70'
                      }\`}`
);

// Wrap icon in certificationUrl link
content = content.replace(
  /<div className="h-28 sm:h-32 rounded-3xl bg-white\/20 dark:bg-zinc-900\/35 border border-white\/25 dark:border-zinc-700\/50 backdrop-blur-md flex items-center justify-center overflow-hidden">/g,
  `<div className="h-28 sm:h-32 rounded-3xl bg-white/20 dark:bg-zinc-900/35 border border-white/25 dark:border-zinc-700/50 backdrop-blur-md flex items-center justify-center overflow-hidden relative">
                        {skill.certificationUrl && (
                          <a href={skill.certificationUrl} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 bg-zinc-900/50 dark:bg-black/50 p-1.5 rounded-full backdrop-blur-md text-white hover:text-amber-400 transition-colors z-10" title="View Certification">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}`
);

fs.writeFileSync('src/pages/Skills.tsx', content);
console.log('updated src/pages/Skills.tsx');
