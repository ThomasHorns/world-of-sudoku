/**
 * Grunnleggende brettstruktur.
 *
 * Et brett er en liste med 81 tall, rad for rad. 0 betyr tom rute.
 * Kandidater lagres som bitmasker: bit (d - 1) er satt hvis sifferet d er mulig.
 */

export type Grid = number[];

export const CELL_COUNT = 81;
export const ALL_DIGITS_MASK = 0x1ff;
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const bit = (digit: number): number => 1 << (digit - 1);

export const rowOf = (cell: number): number => Math.floor(cell / 9);
export const colOf = (cell: number): number => cell % 9;
export const boxOf = (cell: number): number =>
  Math.floor(rowOf(cell) / 3) * 3 + Math.floor(colOf(cell) / 3);

const range9 = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const ROWS: number[][] = range9.map((r) => range9.map((c) => r * 9 + c));
export const COLS: number[][] = range9.map((c) => range9.map((r) => r * 9 + c));
export const BOXES: number[][] = range9.map((b) => {
  const r0 = Math.floor(b / 3) * 3;
  const c0 = (b % 3) * 3;
  return range9.map((i) => (r0 + Math.floor(i / 3)) * 9 + c0 + (i % 3));
});

/** Enhet = rad, kolonne eller boks. Indeks 0–8 er rader, 9–17 kolonner, 18–26 bokser. */
export const UNITS: number[][] = [...ROWS, ...COLS, ...BOXES];

export type UnitKind = 'row' | 'col' | 'box';

export const unitKind = (unit: number): UnitKind =>
  unit < 9 ? 'row' : unit < 18 ? 'col' : 'box';

/** Nummer innen sin type, 1–9 (for visning). */
export const unitNumber = (unit: number): number => (unit % 9) + 1;

/** De tre enhetene en rute tilhører: [rad, kolonne, boks]. */
export const CELL_UNITS: number[][] = Array.from({ length: CELL_COUNT }, (_, c) => [
  rowOf(c),
  9 + colOf(c),
  18 + boxOf(c),
]);

/** De 20 rutene som deler rad, kolonne eller boks med en rute. */
export const PEERS: number[][] = Array.from({ length: CELL_COUNT }, (_, c) => {
  const set = new Set<number>();
  for (const u of CELL_UNITS[c]) for (const p of UNITS[u]) if (p !== c) set.add(p);
  return [...set].sort((a, b) => a - b);
});

/** Ser to ruter hverandre (deler rad, kolonne eller boks)? */
export const sees = (a: number, b: number): boolean =>
  a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b));

export function popcount(mask: number): number {
  let n = 0;
  while (mask) {
    mask &= mask - 1;
    n++;
  }
  return n;
}

export function digitsOf(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) out.push(d);
  return out;
}

/** Laveste siffer i masken (forutsetter at masken ikke er tom). */
export function firstDigit(mask: number): number {
  for (let d = 1; d <= 9; d++) if (mask & bit(d)) return d;
  return 0;
}

/** Leser et brett fra tekst. Godtar 0 eller . for tomme ruter; mellomrom og linjeskift ignoreres. */
export function parseGrid(text: string): Grid {
  const clean = text.replace(/\s+/g, '');
  if (clean.length !== CELL_COUNT) {
    throw new Error(`Brettet må ha 81 ruter, fikk ${clean.length}`);
  }
  return [...clean].map((ch) => {
    if (ch === '.' || ch === '0') return 0;
    const d = Number(ch);
    if (!Number.isInteger(d) || d < 1 || d > 9) throw new Error(`Ugyldig tegn i brett: ${ch}`);
    return d;
  });
}

export function formatGrid(grid: Grid): string {
  return grid.join('');
}

export function cloneGrid(grid: Grid): Grid {
  return grid.slice();
}

export function emptyGrid(): Grid {
  return new Array(CELL_COUNT).fill(0);
}
