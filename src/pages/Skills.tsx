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
  const { skills, profileLoaded, fetchProfileAndSkills } = useDataStore();

  useEffect(() => {
    fetchProfileAndSkills();
  }, [fetchProfileAndSkills]);

  if (!profileLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const sortedSkills = [...skills].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

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
            A visual tool-grid of skills, frameworks, and technical strengths with custom logo support.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {sortedSkills.map((skill, idx) => {
            const level = normalizeLevel(skill.level);
            return (
              <motion.article
                key={skill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group rounded-xl border border-white/30 dark:border-zinc-700/60 bg-white/35 dark:bg-zinc-900/45 backdrop-blur-xl p-3 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-amber-400/70 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="h-28 sm:h-32 rounded-3xl bg-white/20 dark:bg-zinc-900/35 border border-white/25 dark:border-zinc-700/50 backdrop-blur-md flex items-center justify-center overflow-hidden">
                  {skill.iconUrl ? (
                    <div className="block h-full w-full overflow-hidden" title={`${skill.name} logo`}>
                      <img
                        src={skill.iconUrl}
                        alt={`${skill.name} logo`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-amber-100/70 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                      {getSkillIcon(skill.name, skill.category)}
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4">
                  <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white text-center line-clamp-1">
                    {skill.name}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 text-center line-clamp-1">
                    {skill.category}
                  </p>
                  <p className="mt-2 text-[12px] leading-snug text-zinc-600 dark:text-zinc-300 text-center line-clamp-3 min-h-[3.2em]">
                    {getSkillBlurb(skill.name, skill.category, level)}
                  </p>
                </div>

              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
