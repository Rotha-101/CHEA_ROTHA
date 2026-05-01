import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  Code2,
  Database,
  Globe,
  Layout,
  LineChart,
  MessageSquare,
  Server,
  Terminal,
  Wrench,
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const getSkillIcon = (name: string, category: string) => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (
    lowerName.includes('python') ||
    lowerName.includes('javascript') ||
    lowerName.includes('typescript') ||
    lowerName.includes('java')
  ) return <Code2 className="w-5 h-5" />;
  if (lowerName.includes('sql') || lowerName.includes('database') || lowerName.includes('mongo')) return <Database className="w-5 h-5" />;
  if (lowerCat.includes('machine learning') || lowerCat.includes('ai') || lowerName.includes('deep learning')) return <BrainCircuit className="w-5 h-5" />;
  if (lowerCat.includes('time series') || lowerCat.includes('data analysis') || lowerName.includes('pandas')) return <LineChart className="w-5 h-5" />;
  if (lowerCat.includes('nlp') || lowerName.includes('language')) return <MessageSquare className="w-5 h-5" />;
  if (lowerName.includes('react') || lowerName.includes('html') || lowerName.includes('css')) return <Layout className="w-5 h-5" />;
  if (lowerName.includes('node') || lowerName.includes('express') || lowerName.includes('api')) return <Server className="w-5 h-5" />;
  if (lowerName.includes('docker') || lowerName.includes('aws') || lowerName.includes('cloud')) return <Globe className="w-5 h-5" />;
  if (lowerName.includes('git') || lowerName.includes('linux') || lowerName.includes('bash')) return <Terminal className="w-5 h-5" />;

  return <Wrench className="w-5 h-5" />;
};

const normalizeLevel = (level: number) => Math.max(0, Math.min(100, Number(level) || 0));

const getSkillBlurb = (name: string, category: string, level: number) => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerName.includes('python')) return 'Core language for analytics, automation, and model development.';
  if (lowerName.includes('sql')) return 'Query, model, and manage structured data with confidence.';
  if (lowerCategory.includes('machine')) return 'Build practical ML pipelines from feature engineering to prediction.';
  if (lowerCategory.includes('time series')) return 'Forecast trends and seasonality with robust temporal models.';
  if (lowerCategory.includes('visual')) return 'Create clear dashboards and visuals for decision-making.';
  if (lowerCategory.includes('nlp')) return 'Process and model language data for real-world AI use cases.';
  if (lowerCategory.includes('database')) return 'Design schemas and maintain reliable relational data systems.';
  if (lowerCategory.includes('tool')) return 'Productive daily toolkit for coding, experiments, and deployment.';
  if (lowerCategory.includes('programming')) return 'Strong coding foundation for scalable software and data workflows.';
  return `Practical ${category.toLowerCase()} capability with ${level}% proficiency.`;
};

export default function Skills() {
  const { skills, profileLoaded, fetchProfileAndSkills, settings, settingsLoaded, fetchSettings } = useDataStore();

  useEffect(() => {
    fetchProfileAndSkills();
    fetchSettings();
  }, [fetchProfileAndSkills, fetchSettings]);

  if (!profileLoaded || !settingsLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const CATEGORY_ORDER = (settings as any)?.skillCategoryOrder || [
    'IDE & Editors',
    'Programming Languages',
    'Data Wrangling & EDA',
    'Machine Learning',
    'Time Series Forecasting',
    'Deep Learning & AI',
    'NLP',
    'Cloud & MLOps',
    'Data Engineering',
    'Experiment Tracking & Model Management',
    'Statistics & Math',
    'Data Visualization',
    'Databases',
    'Core Strengths'
  ];

  const groupedSkills: { category: string; skills: typeof skills }[] = [];
  
  // Add categories in the exact specified order
  CATEGORY_ORDER.forEach(category => {
    const categorySkills = skills.filter(s => s.category === category).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    if (categorySkills.length > 0) {
      groupedSkills.push({ category, skills: categorySkills });
    }
  });

  // Add any other categories that are not in CATEGORY_ORDER
  const otherCategories = Array.from(new Set(skills.map(s => s.category).filter(c => !CATEGORY_ORDER.includes(c))));
  otherCategories.forEach(category => {
    const categorySkills = skills.filter(s => s.category === category).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    if (categorySkills.length > 0) {
      groupedSkills.push({ category, skills: categorySkills });
    }
  });

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mb-14"
        >
          <p className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300 mb-5">
            Core Skills
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-5">
            Technical Arsenal
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            A categorized visual tool-grid of skills, frameworks, and technical strengths with custom logo support.
          </p>
        </motion.div>

        <div className="space-y-16">
          {groupedSkills.map((group, groupIdx) => (
            <div key={group.category}>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
                className="text-2xl font-display font-semibold text-zinc-900 dark:text-white mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2"
              >
                {group.category}
              </motion.h2>
              <div className="relative w-full overflow-hidden py-6">
                <motion.div 
                  className="flex gap-4 sm:gap-6 w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ 
                    duration: 25 + (group.skills.length * 2), 
                    repeat: Infinity, 
                    ease: "linear",
                  }}
                  whileHover={{ animationPlayState: 'paused' }}
                >
                  {/* We render the list twice for seamless looping */}
                  {[...group.skills, ...group.skills, ...group.skills].map((skill, idx) => {
                    const level = normalizeLevel(skill.level);
                    return (
                      <motion.article
                        key={`${skill.id}-${idx}`}
                        whileHover={{ y: -8, scale: 1.05 }}
                        className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500 w-[150px] sm:w-[170px] h-[220px] flex-shrink-0 ${
                          skill.isHighlighted 
                            ? 'bg-amber-400/10 border border-amber-400/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        } backdrop-blur-md cursor-pointer group`}
                      >
                        {/* Icon Container */}
                        <div className="relative flex-1 w-full flex items-center justify-center mb-4">
                          <div className={`absolute inset-4 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                            skill.isHighlighted ? 'bg-amber-400' : 'bg-white'
                          }`} />
                          
                          <div className="h-full w-full p-2 flex items-center justify-center relative z-0">
                            {skill.iconUrl ? (
                              <img
                                src={skill.iconUrl}
                                alt={`${skill.name} logo`}
                                className="max-h-16 sm:max-h-20 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500 flex items-center justify-center">
                                {getSkillIcon(skill.name, skill.category)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center w-full mt-auto">
                          <div className="h-12 mb-1 flex flex-col justify-center px-1">
                            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-2 leading-tight">
                              {skill.name}
                            </h3>
                            <p className="mt-1 text-[8px] sm:text-[9px] font-mono font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400/70 line-clamp-1">
                              {skill.category}
                            </p>
                          </div>
                          
                          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${level}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full ${skill.isHighlighted ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white/40'}`}
                            />
                          </div>
                          
                          <div className="mt-2 h-8 overflow-hidden">
                            <p className="text-[10px] leading-snug text-zinc-600 dark:text-zinc-300/80 line-clamp-2 italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {skill.description || getSkillBlurb(skill.name, skill.category, level)}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
