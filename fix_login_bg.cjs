const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

// Move bgImage declaration up
content = content.replace(
  /const navigate = useNavigate\(\);\s*const location = useLocation\(\);/,
  `const navigate = useNavigate();
  const location = useLocation();
  const bgImage = settings?.heroBackgroundImageUrl || publicProfile?.coverImageUrl;`
);

// Remove the old bgImage declaration further down
content = content.replace(
  /const bgImage = settings\?\.heroBackgroundImageUrl \|\| publicProfile\?\.coverImageUrl;\s*return \(/,
  'return ('
);

// Update login screen return
const oldLoginReturn = /return \([\s\S]*?<div className="absolute inset-0 bg-white\/60 dark:bg-black\/50 transition-colors duration-300 pointer-events-none" \/>/;

const newLoginReturn = `return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300 relative bg-primary">
        {bgImage && (
          <div
            aria-hidden
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
            style={{ backgroundImage: \`url("\${bgImage}")\` }}
          />
        )}
        <div
          aria-hidden
          className={"fixed inset-0 z-0 pointer-events-none transition-colors duration-300 " + (bgImage ? 'bg-white/60 dark:bg-black/50' : 'bg-white dark:bg-black')}
        />`;

content = content.replace(oldLoginReturn, newLoginReturn);

fs.writeFileSync('src/components/AdminLayout.tsx', content);
console.log('Fixed login background');
