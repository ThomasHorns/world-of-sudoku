/**
 * Lager ferdige App Store-skjermbilder: blå bakgrunn, overskrift øverst og appskjermen under,
 * i nøyaktig de størrelsene Apple krever.
 *
 * Råbilder (skjermbilder tatt på iPhone/iPad) legges her:
 *   store/screenshots/raw/iphone/en/1.png … 6.png
 *   store/screenshots/raw/iphone/no/1.png … 6.png
 *   store/screenshots/raw/ipad/en/1.png …
 *   store/screenshots/raw/ipad/no/1.png …
 * (png, jpg eller webp; nummeret bestemmer overskriften under.)
 *
 * Ferdige bilder skrives til store/screenshots/{iphone,ipad}/{en,no}/N.png
 *
 * Bruk: npm run make-screenshots
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BLUE = '#185FA5';
const WHITE = '#FFFFFF';

/** Overskrifter per bilde. \n gir linjeskift. */
const CAPTIONS: Record<number, { en: string; no: string }> = {
  1: { en: 'Clean, calm\nsudoku', no: 'Ren og rolig\nsudoku' },
  2: { en: 'Hints that explain\nthe logic', no: 'Tips som forklarer\nlogikken' },
  3: { en: 'Five levels and\na daily puzzle', no: 'Fem nivåer og\ndagens brett' },
  4: { en: 'Every game\nis timed', no: 'Alle spill\ntas tid på' },
  5: { en: 'Go Pro and climb\nthe leaderboards', no: 'Kjøp Pro og klatre\npå topplistene' },
  6: { en: 'Light and\ndark mode', no: 'Lys og\nmørk modus' },
};

/**
 * Størrelser Apple krever (stående).
 * App Store Connect ber nå om «iPhone with Dynamic Island (medium display)»: 1206 × 2622 eller 1179 × 2556.
 * 6,9"-størrelsen (1320 × 2868) lages også, i tilfelle den trengs.
 */
const DEVICES = {
  iphone: { width: 1206, height: 2622, captionTop: 192, fontSize: 102, shotWidth: 0.8, shotTop: 585 },
  'iphone-6.9': { width: 1320, height: 2868, captionTop: 210, fontSize: 112, shotWidth: 0.8, shotTop: 640 },
  ipad: { width: 2064, height: 2752, captionTop: 190, fontSize: 120, shotWidth: 0.74, shotTop: 600 },
} as const;

/** Hvilken råbilde-mappe hver størrelse bruker. */
const RAW_FOLDER: Record<keyof typeof DEVICES, string> = {
  iphone: 'iphone',
  'iphone-6.9': 'iphone',
  ipad: 'ipad',
};

type Device = keyof typeof DEVICES;
type Lang = 'en' | 'no';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = join(root, 'store', 'screenshots', 'raw');
const outDir = join(root, 'store', 'screenshots');

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function captionSvg(text: string, d: (typeof DEVICES)[Device]): Buffer {
  const lines = text.split('\n');
  const lineHeight = d.fontSize * 1.18;
  const tspans = lines
    .map((line, i) => `<tspan x="${d.width / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${d.width}" height="${d.height}">` +
      `<text x="${d.width / 2}" y="${d.captionTop + d.fontSize}" text-anchor="middle" ` +
      `font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" ` +
      `font-size="${d.fontSize}" fill="${WHITE}">${tspans}</text></svg>`,
  );
}

async function roundedShot(file: string, width: number, radius: number): Promise<{ buf: Buffer; height: number }> {
  const resized = await sharp(file).resize({ width }).png().toBuffer();
  const { height = 0 } = await sharp(resized).metadata();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
  const buf = await sharp(resized)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return { buf, height };
}

async function make(device: Device, lang: Lang, index: number, file: string, out: string) {
  const d = DEVICES[device];
  const caption = CAPTIONS[index]?.[lang];
  if (!caption) throw new Error(`Ingen overskrift for bilde ${index}`);
  const shotWidth = Math.round(d.width * d.shotWidth);
  const { buf, height } = await roundedShot(file, shotWidth, Math.round(shotWidth * 0.06));
  // Bildet kan gå ut i bunnkanten; det som stikker ut, kuttes.
  const visible = Math.min(height, d.height - d.shotTop);
  const shot = visible < height ? await sharp(buf).extract({ left: 0, top: 0, width: shotWidth, height: visible }).toBuffer() : buf;
  await sharp({ create: { width: d.width, height: d.height, channels: 3, background: BLUE } })
    .composite([
      { input: captionSvg(caption, d), top: 0, left: 0 },
      { input: shot, top: d.shotTop, left: Math.round((d.width - shotWidth) / 2) },
    ])
    .png()
    .toFile(out);
}

async function main() {
  let count = 0;
  for (const device of Object.keys(DEVICES) as Device[]) {
    for (const lang of ['en', 'no'] as Lang[]) {
      const dir = join(rawDir, RAW_FOLDER[device], lang);
      if (!existsSync(dir)) continue;
      const files = readdirSync(dir).filter((f) => /^\d+\.(png|jpe?g|webp)$/i.test(f));
      if (files.length === 0) continue;
      const target = join(outDir, device, lang);
      mkdirSync(target, { recursive: true });
      for (const f of files.sort()) {
        const index = Number(f.replace(extname(f), ''));
        const out = join(target, `${index}.png`);
        await make(device, lang, index, join(dir, f), out);
        count++;
        console.log(`${device}/${lang}/${index}.png`);
      }
    }
  }
  console.log(count ? `\nFerdig: ${count} bilder i store/screenshots/` : 'Fant ingen råbilder i store/screenshots/raw/.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
