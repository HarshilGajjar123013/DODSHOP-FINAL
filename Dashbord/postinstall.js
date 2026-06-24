const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir);
}

const packagesToLink = ['next', 'react', 'react-dom'];
packagesToLink.forEach(pkg => {
  const target = path.join(__dirname, '..', 'node_modules', pkg);
  const dest = path.join(nodeModulesDir, pkg);

  if (fs.existsSync(target)) {
    if (fs.existsSync(dest)) {
      try {
        fs.unlinkSync(dest);
      } catch (err) {
        try {
          fs.rmSync(dest, { recursive: true, force: true });
        } catch (e) {}
      }
    }
    try {
      fs.symlinkSync(target, dest, process.platform === 'win32' ? 'junction' : 'dir');
      console.log(`Linked ${pkg} -> ${target}`);
    } catch (err) {
      console.error(`Failed to link ${pkg}:`, err.message);
    }
  } else {
    console.warn(`Target not found for linking: ${target}`);
  }
});
