import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SNIPPETS = [
  {
    language: 'typescript',
    code: `const Title = ({ title, children }: {
  title: string;
  children: (s: string) => React.ReactNode;
}) => {
  return <>{children(title)}</>;
};`,
    title: 'Component.tsx'
  },
  {
    language: 'python',
    code: `def train_model(X, y):
    model = RandomForestClassifier()
    model.fit(X, y)
    accuracy = model.score(X_test, y_test)
    print(f"Accuracy: {accuracy:.4f}")
    return model`,
    title: 'model_trainer.py'
  },
  {
    language: 'javascript',
    code: `export const useDataStore = create((set) => ({
  profile: null,
  skills: [],
  fetchData: async () => {
    const res = await fetch('/api/data');
    set({ profile: await res.json() });
  }
}));`,
    title: 'store.ts'
  }
];

export default function CodingConsole() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentSnippet = SNIPPETS[snippetIndex].code;

    if (isTyping) {
      if (displayedCode.length < currentSnippet.length) {
        timeout = setTimeout(() => {
          setDisplayedCode(currentSnippet.slice(0, displayedCode.length + 1));
        }, 50); // Slower typing (was 30ms)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 4000); // Wait longer at end (was 3000ms)
      }
    } else {
      if (displayedCode.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedCode(displayedCode.slice(0, -1));
        }, 20); // Slower backspacing (was 15ms)
      } else {
        setSnippetIndex((prev) => (prev + 1) % SNIPPETS.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedCode, isTyping, snippetIndex]);

  const highlightCode = (code: string) => {
    return code.split(/(\s+|[{}()[\].,;:])/).map((part, i) => {
      if (/^(const|let|var|function|return|import|export|def|class|if|else|for|while|async|await|async|await)$/.test(part)) {
        return <span key={i} className="text-[#d12d2d] dark:text-[#ff4d4d]">{part}</span>;
      }
      if (/^[A-Z][a-zA-Z0-9]*$/.test(part)) {
        return <span key={i} className="text-[#953800] dark:text-[#ffb86c]">{part}</span>;
      }
      if (/^'.*'$|^".*"$/.test(part)) {
        return <span key={i} className="text-[#22863a] dark:text-[#50fa7b]">{part}</span>;
      }
      if (/^\d+$/.test(part)) {
        return <span key={i} className="text-[#005cc5] dark:text-[#bd93f9]">{part}</span>;
      }
      if (/^[{}()[\].,;:]$/.test(part)) {
        return <span key={i} className="text-zinc-400 dark:text-zinc-500">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-2xl bg-zinc-50 dark:bg-[#0d1117] font-mono text-[10px] sm:text-xs md:text-sm transition-colors duration-500"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-zinc-500 dark:text-zinc-500 text-[10px] font-medium uppercase tracking-widest">
          {SNIPPETS[snippetIndex].title}
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Terminal Content */}
      <div className="p-6 min-h-[180px] sm:min-h-[250px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff4d4d]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex">
          {/* Line Numbers */}
          <div className="pr-4 text-zinc-400 dark:text-zinc-600 text-right select-none opacity-50">
            {displayedCode.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          
          {/* Code */}
          <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap flex-1">
            {highlightCode(displayedCode)}
            <span className="w-2 h-4 bg-[#ff4d4d] inline-block align-middle ml-1 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
