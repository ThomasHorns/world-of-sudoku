/**
 * Kontrollerer hele brettbanken: hvert brett skal ha én løsning, kunne løses
 * uten gjetting, graderes til riktig nivå og ha riktig fasit.
 * Skriver også ut statistikk per nivå.
 *
 * Bruk: npm run verify-bank
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gradePuzzle, Level, parseGrid, TechniqueId, verifyPuzzle } from '../packages/engine/src';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

for (const level of [1, 2, 3, 4, 5] as Level[]) {
  const file = join(root, 'packages', 'puzzle-bank', 'data', `level-${level}.json`);
  const bank = JSON.parse(readFileSync(file, 'utf8')) as {
    puzzles: { id: string; puzzle: string; solution: string }[];
  };
  const ids = new Set<string>();
  const texts = new Set<string>();
  let givensTotal = 0;
  let givensMin = 81;
  let givensMax = 0;
  const techniques: Partial<Record<TechniqueId, number>> = {};

  for (const p of bank.puzzles) {
    const puzzle = parseGrid(p.puzzle);
    const problems = verifyPuzzle(puzzle, parseGrid(p.solution), level);
    if (ids.has(p.id)) problems.push('dobbel id');
    if (texts.has(p.puzzle)) problems.push('duplikat');
    ids.add(p.id);
    texts.add(p.puzzle);
    if (problems.length) {
      failures++;
      console.error(`  ${p.id}: ${problems.join(', ')}`);
    }
    const givens = puzzle.filter((v) => v !== 0).length;
    givensTotal += givens;
    givensMin = Math.min(givensMin, givens);
    givensMax = Math.max(givensMax, givens);
    for (const [t, n] of Object.entries(gradePuzzle(puzzle).techniques)) {
      techniques[t as TechniqueId] = (techniques[t as TechniqueId] ?? 0) + (n ?? 0);
    }
  }

  const avg = (givensTotal / bank.puzzles.length).toFixed(1);
  console.log(
    `Nivå ${level}: ${bank.puzzles.length} brett, utgangstall ${givensMin}–${givensMax} (snitt ${avg})`,
  );
  const used = Object.entries(techniques)
    .map(([t, n]) => `${t} ${n}`)
    .join(', ');
  console.log(`  teknikker brukt: ${used}`);
}

if (failures) {
  console.error(`\n${failures} brett feilet kontrollen.`);
  process.exit(1);
}
console.log('\nAlle brett bestod kontrollen.');
