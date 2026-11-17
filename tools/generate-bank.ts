/**
 * Lager brettbanken for alle nivåer.
 *
 * Bruk:
 *   npm run generate-bank -- [--count 1000] [--seed 2026] [--levels 1,2,3,4,5]
 *
 * Samme frø gir samme brettbank, så den kan alltid gjenskapes.
 * Resultatet skrives til packages/puzzle-bank/data/level-N.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRng, formatGrid, Level, tryGeneratePuzzle } from '../packages/engine/src';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const count = Number(arg('count', '1000'));
const seed = Number(arg('seed', '2026'));
const levels = arg('levels', '1,2,3,4,5').split(',').map(Number) as Level[];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'packages', 'puzzle-bank', 'data');
mkdirSync(outDir, { recursive: true });

for (const level of levels) {
  // Eget frø per nivå, så et nivå kan lages på nytt uten å endre de andre.
  const rng = createRng(seed * 10 + level);
  const seen = new Set<string>();
  const puzzles: { id: string; puzzle: string; solution: string }[] = [];
  const started = Date.now();
  let attempts = 0;
  while (puzzles.length < count) {
    attempts++;
    const p = tryGeneratePuzzle(level, rng);
    if (!p) continue;
    const text = formatGrid(p.puzzle);
    if (seen.has(text)) continue;
    seen.add(text);
    puzzles.push({
      id: `${level}-${String(puzzles.length + 1).padStart(4, '0')}`,
      puzzle: text,
      solution: formatGrid(p.solution),
    });
    if (puzzles.length % 100 === 0) {
      console.log(`  nivå ${level}: ${puzzles.length}/${count}`);
    }
  }
  const file = join(outDir, `level-${level}.json`);
  writeFileSync(file, JSON.stringify({ level, seed, count: puzzles.length, puzzles }, null, 0) + '\n');
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`Nivå ${level}: ${puzzles.length} brett på ${secs} s (${attempts} forsøk) -> ${file}`);
}
