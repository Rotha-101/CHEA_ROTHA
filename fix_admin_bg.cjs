const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

const targetStr = `  return (
    <div 
      className="h-screen overflow-hidden bg-primary flex transition-colors duration-300 relative"
      style={settings?.backgroundImage ? {
        backgroundImage: \`url(\${settings.backgroundImage})\`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      <div className="absolute inset-0 bg-white/60 dark:bg-black/50 transition-colors duration-300 pointer-events-none" />`;

const replacement = `  const bgImage = settings?.heroBackgroundImageUrl || profile?.coverImageUrl;

  return (
    <div className="h-screen overflow-hidden flex transition-colors duration-300 relative bg-primary">
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

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminLayout.tsx', content);
console.log('Fixed background image in AdminLayout');
