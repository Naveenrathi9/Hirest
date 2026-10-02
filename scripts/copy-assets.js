const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy public to build/standalone/public
copyDir(path.join(__dirname, '../public'), path.join(__dirname, '../build/standalone/public'));

// Copy build/static to build/standalone/build/static
copyDir(path.join(__dirname, '../build/static'), path.join(__dirname, '../build/standalone/build/static'));

console.log('✅ Standalone hosting assets copied successfully into build/standalone');
