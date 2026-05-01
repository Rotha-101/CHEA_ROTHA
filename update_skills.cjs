const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Skills.tsx', 'utf8');

content = content.replace(
  /const formattedData = \{\s*\.\.\.data,\s*level: Number\(data\.level\),\s*priority: Number\(data\.priority\) \|\| 0\s*\};/g,
  `const formattedData = {
        ...data,
        level: Number(data.level),
        priority: Number(data.priority) || 0,
        yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined,
      };`
);

content = content.replace(
  /<input type="text" list="categories" \{\.\.\.register\('category', \{ required: true \}\)\} placeholder="e\.g\., Frontend, Backend, Tools" className="[^"]*" \/>\s*<datalist id="categories">[\s\S]*?<\/datalist>/,
  `<select {...register('category', { required: true })} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500">
                  <option value="">Select a category</option>
                  {categoryOrderList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>`
);

content = content.replace(
  /<div className="sm:col-span-3">\s*<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority \(lower is first\)<\/label>\s*<input type="number" \{\.\.\.register\('priority'\)\} className="[^"]*" \/>\s*<\/div>/,
  `<div className="sm:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Priority (lower is first)</label>
                <input type="number" {...register('priority')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description / Custom Blurb</label>
                <textarea rows={2} {...register('description')} placeholder="A brief description of how you use this skill..." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Years of Experience</label>
                <input type="number" step="0.5" min="0" {...register('yearsOfExperience')} className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Certification URL (Optional)</label>
                <input type="url" {...register('certificationUrl')} placeholder="https://..." className="mt-1 block w-full sm:text-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500" />
              </div>

              <div className="sm:col-span-6 flex items-center">
                <input type="checkbox" id="isHighlighted" {...register('isHighlighted')} className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-zinc-300 rounded" />
                <label htmlFor="isHighlighted" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Highlight this skill (shows special glow/badge on the public page)
                </label>
              </div>`
);

fs.writeFileSync('src/pages/admin/Skills.tsx', content);
console.log('updated src/pages/admin/Skills.tsx');
