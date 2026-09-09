const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const root = path.join(__dirname, '..');

// Transparent version of the previous Laravel /storage/logo.ico emblem.
// Keep the source in the repository so favicon regeneration is reproducible.
async function run() {
  const source = path.join(root, 'public/favicon-transparent.png');
  const metadata = await sharp(source).metadata();
  if (!metadata.hasAlpha) throw new Error('Favicon source must have an alpha channel');
  const sizes = new Map();
  for (const size of [16, 32, 48, 180, 192, 512]) {
    sizes.set(size, await sharp(source).resize(size, size, {
      fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 },
    }).png().toBuffer());
  }
  const files = {
    'public/favicon-16x16.png': 16,
    'public/favicon-32x32.png': 32,
    'public/favicon.png': 48,
    'public/apple-touch-icon.png': 180,
    'public/apple-touch-icon-precomposed.png': 180,
    'public/android-chrome-192x192.png': 192,
    'public/android-chrome-512x512.png': 512,
    'app/icon.png': 32,
    'app/apple-icon.png': 180,
  };
  for (const [file, size] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, file), sizes.get(size));
  }
  const iconSizes = [16, 32, 48];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(iconSizes.length, 4);
  let offset = 6 + iconSizes.length * 16;
  const entries = iconSizes.map((size) => {
    const entry = Buffer.alloc(16);
    entry[0] = entry[1] = size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(sizes.get(size).length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += sizes.get(size).length;
    return entry;
  });
  fs.writeFileSync(path.join(root, 'public/favicon.ico'), Buffer.concat([
    header, ...entries, ...iconSizes.map((size) => sizes.get(size)),
  ]));
  console.log('Generated transparent PNG icons and multi-resolution favicon.ico');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
