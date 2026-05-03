const fs = require('fs');
const file = 'src/pages/admin/Skills.tsx';
let c = fs.readFileSync(file, 'utf8');

// Replace the broken toggleCategory with the correct auto-saving version
const regex = /const toggleCategory = async \(cat: string\) =>[\s\S]*?setDisabledCategories\(disabledCategories\);\s*\}\s*\};/;

const fixed = [
  '  const toggleCategory = async (cat: string) => {',
  '    const newDisabled = disabledCategories.includes(cat)',
  '      ? disabledCategories.filter(c => c !== cat)',
  '      : [...disabledCategories, cat];',
  '    setDisabledCategories(newDisabled);',
  '    try {',
  '      const res = await fetch(`' + '${API_URL}' + '/db/settings`);',
  '      const current = await res.json();',
  '      current.disabledSkillCategories = newDisabled;',
  '      await fetch(`' + '${API_URL}' + '/db/settings`, {',
  "        method: 'POST',",
  "        headers: { 'Content-Type': 'application/json' },",
  '        body: JSON.stringify(current)',
  '      });',
  '      const msg = newDisabled.includes(cat)',
  "        ? '\"' + cat + '\" hidden from public page'",
  "        : '\"' + cat + '\" now visible on public page';",
  '      showToast(msg);',
  '    } catch {',
  "      showToast('Save failed - try again');",
  '      setDisabledCategories(disabledCategories);',
  '    }',
  '  };'
].join('\n');

if (regex.test(c)) {
  c = c.replace(regex, fixed);
  fs.writeFileSync(file, c, 'utf8');
  console.log('PATCHED OK');
} else {
  console.log('PATTERN NOT FOUND - dumping surrounding code:');
  const idx = c.indexOf('toggleCategory');
  console.log(c.slice(idx, idx + 300));
}
