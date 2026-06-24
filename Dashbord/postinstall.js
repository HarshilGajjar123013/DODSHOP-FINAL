const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Run Prisma generation on Vercel/Local
try {
  console.log('[POSTINSTALL] Generating Prisma client...');
  const schemaPath = path.resolve(__dirname, '..', 'packages', 'database', 'prisma', 'schema.prisma');
  execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: 'inherit' });
  console.log('[POSTINSTALL] Prisma client generated successfully.');
} catch (err) {
  console.warn('[POSTINSTALL] Warning: Prisma client generation failed/skipped (expected if engines are locked locally):', err.message);
}

// 2. Setup dependency symlinks
const nodeModulesDir = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir);
}

const packagesToLink = ['next', 'react', 'react-dom', '@prisma', '.prisma', 'prisma'];
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
