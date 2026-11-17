/**
 * Rask løser med prøving og feiling (backtracking). Brukes til å finne fasit,
 * sjekke at et brett har nøyaktig én løsning og lage ferdige løsningsbrett.
 * Dette er IKKE måten spilleren løser på – se logic.ts for menneskelige teknikker.
 */
import { ALL_DIGITS_MASK, bit, boxOf, CELL_COUNT, colOf, Grid, rowOf } from './board';
import { Rng, shuffle } from './random';

interface SearchState {
  grid: Grid;
  rows: number[];
  cols: number[];
  boxes: number[];
}

function initState(grid: Grid): SearchState | null {
  const s: SearchState = {
    grid: grid.slice(),
    rows: new Array(9).fill(0),
    cols: new Array(9).fill(0),
    boxes: new Array(9).fill(0),
  };
  for (let c = 0; c < CELL_COUNT; c++) {
    const v = grid[c];
    if (v === 0) continue;
    const b = bit(v);
    const r = rowOf(c);
    const k = colOf(c);
    const x = boxOf(c);
    if (s.rows[r] & b || s.cols[k] & b || s.boxes[x] & b) return null;
    s.rows[r] |= b;
    s.cols[k] |= b;
    s.boxes[x] |= b;
  }
  return s;
}

/** Finner tom rute med færrest muligheter. Returnerer -1 hvis brettet er fullt. */
function pickCell(s: SearchState): { cell: number; mask: number } {
  let best = -1;
  let bestMask = 0;
  let bestCount = 10;
  for (let c = 0; c < CELL_COUNT; c++) {
    if (s.grid[c] !== 0) continue;
    const mask = ALL_DIGITS_MASK & ~(s.rows[rowOf(c)] | s.cols[colOf(c)] | s.boxes[boxOf(c)]);
    let n = 0;
    for (let m = mask; m; m &= m - 1) n++;
    if (n < bestCount) {
      best = c;
      bestMask = mask;
      bestCount = n;
      if (n <= 1) break;
    }
  }
  return { cell: best, mask: bestMask };
}

function search(
  s: SearchState,
  limit: number,
  found: Grid[],
  order: number[],
): void {
  const { cell, mask } = pickCell(s);
  if (cell === -1) {
    found.push(s.grid.slice());
    return;
  }
  if (mask === 0) return;
  const r = rowOf(cell);
  const k = colOf(cell);
  const x = boxOf(cell);
  for (const d of order) {
    const b = bit(d);
    if (!(mask & b)) continue;
    s.grid[cell] = d;
    s.rows[r] |= b;
    s.cols[k] |= b;
    s.boxes[x] |= b;
    search(s, limit, found, order);
    s.grid[cell] = 0;
    s.rows[r] &= ~b;
    s.cols[k] &= ~b;
    s.boxes[x] &= ~b;
    if (found.length >= limit) return;
  }
}

const DEFAULT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Antall løsninger, men slutter å telle ved `limit` (standard 2 – nok til å avgjøre om løsningen er unik). */
export function countSolutions(grid: Grid, limit = 2): number {
  const s = initState(grid);
  if (!s) return 0;
  const found: Grid[] = [];
  search(s, limit, found, DEFAULT_ORDER);
  return found.length;
}

export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}

/** Første løsning som finnes, eller null hvis brettet ikke kan løses. */
export function solve(grid: Grid): Grid | null {
  const s = initState(grid);
  if (!s) return null;
  const found: Grid[] = [];
  search(s, 1, found, DEFAULT_ORDER);
  return found[0] ?? null;
}

/** Et tilfeldig, ferdig utfylt gyldig brett. */
export function generateSolvedGrid(rng: Rng): Grid {
  const s = initState(new Array(CELL_COUNT).fill(0))!;
  const found: Grid[] = [];
  // Ny tilfeldig sifferrekkefølge for hver løsning gir stor variasjon.
  search(s, 1, found, shuffle(DEFAULT_ORDER, rng));
  // Bland også rader/kolonner innen bånd og selve båndene for ekstra variasjon.
  return randomizeSymmetries(found[0], rng);
}

/** Bytter rader innen bånd, bånd, kolonner innen stabler og stabler. Gir fortsatt gyldig brett. */
function randomizeSymmetries(grid: Grid, rng: Rng): Grid {
  const bandOrder = shuffle([0, 1, 2], rng);
  const rowMap = bandOrder.flatMap((b) => shuffle([0, 1, 2], rng).map((i) => b * 3 + i));
  const stackOrder = shuffle([0, 1, 2], rng);
  const colMap = stackOrder.flatMap((s) => shuffle([0, 1, 2], rng).map((i) => s * 3 + i));
  const digitMap = [0, ...shuffle(DEFAULT_ORDER, rng)];
  const out = new Array(CELL_COUNT).fill(0);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      out[r * 9 + c] = digitMap[grid[rowMap[r] * 9 + colMap[c]]];
    }
  }
  return out;
}
