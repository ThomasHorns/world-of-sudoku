/**
 * Lager app-ikoner og oppstartsbilde fra logo A (3×3-rutenett med 9 i midten, blå).
 * Midlertidig utgave: kjør skriptet på nytt når den endelige logoen er tegnet.
 *
 * Bruk: npm run generate-icons
 * Skriver til app/assets/.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const BLUE = '#185FA5';
const LIGHT = '#E6F1FB';
const WHITE = '#FFFFFF';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'app', 'assets');

interface GridOptions {
  /** Senter og størrelse på rutenettet. */
  cx: number;
  cy: number;
  size: number;
  line: string;
  cell: string;
  digit: string;
  /** Tegn 9-tallet som hull i midtruten (for monokromt ikon). */
  digitAsHole?: boolean;
}

function grid(o: GridOptions): string {
  const s = o.size;
  const c = s / 3;
  const x0 = o.cx - s / 2;
  const y0 = o.cy - s / 2;
  const sw = s * 0.045;
  const lines = [1, 2]
    .flatMap((i) => [
      `<line x1="${x0 + c * i}" y1="${y0}" x2="${x0 + c * i}" y2="${y0 + s}"/>`,
      `<line x1="${x0}" y1="${y0 + c * i}" x2="${x0 + s}" y2="${y0 + c * i}"/>`,
    ])
    .join('');
  const inset = c * 0.13;
  const cellX = x0 + c + inset;
  const cellY = y0 + c + inset;
  const cellW = c - inset * 2;
  const fontSize = c * 0.72;
  const text = `<text x="${o.cx}" y="${o.cy + fontSize * 0.36}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}"`;
  const center = o.digitAsHole
    ? `<mask id="hole"><rect x="${cellX}" y="${cellY}" width="${cellW}" height="${cellW}" rx="${cellW * 0.22}" fill="white"/>${text} fill="black">9</text></mask>
       <rect x="${cellX}" y="${cellY}" width="${cellW}" height="${cellW}" rx="${cellW * 0.22}" fill="${o.cell}" mask="url(#hole)"/>`
    : `<rect x="${cellX}" y="${cellY}" width="${cellW}" height="${cellW}" rx="${cellW * 0.22}" fill="${o.cell}"/>
       ${text} fill="${o.digit}">9</text>`;
  return `<g stroke="${o.line}" stroke-width="${sw}" stroke-linecap="round">${lines}</g>${center}`;
}

function svg(size: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
}

function render(name: string, content: string, width: number): void {
  const png = new Resvg(content, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
  })
    .render()
    .asPng();
  writeFileSync(join(assets, name), png);
  console.log(`${name} (${width}×${width})`);
}

const S = 1024;
const mid = S / 2;

// Hovedikon (iOS og standard): blå flate helt ut i kantene – systemet runder hjørnene selv.
render(
  'icon.png',
  svg(S, `<rect width="${S}" height="${S}" fill="${BLUE}"/>${grid({ cx: mid, cy: mid, size: 600, line: LIGHT, cell: LIGHT, digit: BLUE })}`),
  1024,
);

// Android adaptivt ikon: forgrunn innenfor den sikre sonen (sirkel på 66 %), bakgrunn helt blå.
render(
  'android-icon-foreground.png',
  svg(S, grid({ cx: mid, cy: mid, size: 440, line: LIGHT, cell: LIGHT, digit: BLUE })),
  1024,
);
render('android-icon-background.png', svg(S, `<rect width="${S}" height="${S}" fill="${BLUE}"/>`), 1024);
render(
  'android-icon-monochrome.png',
  svg(S, grid({ cx: mid, cy: mid, size: 440, line: WHITE, cell: WHITE, digit: WHITE, digitAsHole: true })),
  1024,
);

// Oppstartsbilde og favicon: avrundet blå firkant med rutenettet.
const rounded = svg(
  S,
  `<rect width="${S}" height="${S}" rx="${S * 0.22}" fill="${BLUE}"/>${grid({ cx: mid, cy: mid, size: 600, line: LIGHT, cell: LIGHT, digit: BLUE })}`,
);
render('splash-icon.png', rounded, 1024);
render('favicon.png', rounded, 48);
