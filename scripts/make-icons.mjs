// Erzeugt die PWA-Icons aus einem SVG: node scripts/make-icons.mjs
import sharp from 'sharp'

const icon = (inset) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#16181B"/>
  <g transform="translate(${inset} ${inset}) scale(${(512 - 2 * inset) / 512})">
    <path d="M96 140 L168 372 L256 200 L344 372 L416 140" fill="none" stroke="#6EA2FF" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="256" cy="108" r="26" fill="#FFB547"/>
  </g>
</svg>`

const targets = [
  ['public/icons/icon-192.png', 192, 0],
  ['public/icons/icon-512.png', 512, 0],
  ['public/icons/icon-512-maskable.png', 512, 64],
  ['public/icons/apple-touch-icon.png', 180, 0],
]
for (const [file, size, inset] of targets) {
  await sharp(Buffer.from(icon(inset))).resize(size, size).png().toFile(file)
  console.log('erzeugt', file)
}
