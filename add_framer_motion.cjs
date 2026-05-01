const fs = require('fs');
let content = fs.readFileSync('src/components/PublicLayout.tsx', 'utf8');

// Add import { motion } from 'motion/react'; if it's not there
if (!content.includes("import { motion } from 'motion/react';")) {
  content = content.replace(
    /import React, \{ useEffect, useState, useMemo \} from 'react';/,
    "import React, { useEffect, useState, useMemo } from 'react';\nimport { motion } from 'motion/react';"
  );
}

// Desktop replacement
const desktopRegex = /<a\s+key=\{item\.name\}\s+href=\{item\.href\}\s+onClick=\{\(e\) => scrollToSection\(e, item\.href\)\}\s+className=\{cn\(\s*'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',\s*activeSection === item\.href\.substring\(1\)\s*\?\s*'bg-white\/30 dark:bg-white\/10 backdrop-blur-md shadow-sm border border-white\/40 dark:border-white\/10 text-zinc-900 dark:text-white'\s*:\s*'text-zinc-600 hover:bg-white\/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white\/5 dark:hover:text-white'\s*\)\}\s*>\s*\{item\.name\}\s*<\/a>/;

const newDesktop = `<a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={cn(
                  'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 z-0',
                  activeSection === item.href.substring(1)
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:bg-white/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                )}
              >
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeTabIndicatorDesktop"
                    className="absolute inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {item.name}
              </a>`;

content = content.replace(desktopRegex, newDesktop);

// Mobile replacement
const mobileRegex = /<a\s+key=\{item\.name\}\s+href=\{item\.href\}\s+onClick=\{\(e\) => \{\s*scrollToSection\(e, item\.href\);\s*setMobileMenuOpen\(false\);\s*\}\}\s+className=\{cn\(\s*'flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200',\s*activeSection === item\.href\.substring\(1\)\s*\?\s*'bg-white\/30 dark:bg-white\/10 backdrop-blur-md shadow-sm border border-white\/40 dark:border-white\/10 text-zinc-900 dark:text-white'\s*:\s*'text-zinc-600 hover:bg-white\/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white\/5 dark:hover:text-white'\s*\)\}\s*>\s*<item\.icon className="h-5 w-5" \/>\s*\{item\.name\}\s*<\/a>/;

const newMobile = `<a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  scrollToSection(e, item.href);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors duration-200 z-0',
                  activeSection === item.href.substring(1)
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-600 hover:bg-white/20 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                )}
              >
                {activeSection === item.href.substring(1) && (
                  <motion.div
                    layoutId="activeTabIndicatorMobile"
                    className="absolute inset-0 bg-white/30 dark:bg-white/10 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{item.name}</span>
              </a>`;

content = content.replace(mobileRegex, newMobile);

fs.writeFileSync('src/components/PublicLayout.tsx', content);
console.log('Framer Motion sliding pill added to PublicLayout.tsx');
