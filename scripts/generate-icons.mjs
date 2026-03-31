import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2d2d2d"/>
        <stop offset="100%" style="stop-color:#1a1a1a"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="96" fill="url(#bg)"/>
    <text x="256" y="280" font-family="Arial" font-size="220" font-weight="bold" fill="#e5e7eb" text-anchor="middle">F</text>
    <circle cx="256" cy="200" r="30" fill="#6366f1"/>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

  for (const size of sizes) {
    const filename = size === 192 ? 'icon-192.png' : size === 512 ? 'icon-512.png' : `icon-${size}.png`;
    await sharp(buffer).resize(size, size).png().toFile(path.join(publicDir, filename));
    console.log(`Created ${filename}`);
  }

  const ico = await pngToIco([path.join(publicDir, 'icon-192.png'), path.join(publicDir, 'icon-512.png')]);
  fs.writeFileSync(path.join(publicDir, 'icon.ico'), ico);
  console.log('Created icon.ico');
}

generateIcons().catch(console.error);