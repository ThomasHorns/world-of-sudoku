/**
 * Velger et brett spilleren ikke har spilt før. Når alle er spilt, kan alle velges igjen.
 */
export interface PuzzleRef {
  id: string;
  puzzle: string;
  solution: string;
}

export function pickPuzzle<T extends PuzzleRef>(
  bank: T[],
  played: string[],
  random: () => number = Math.random,
): T {
  const seen = new Set(played);
  const fresh = bank.filter((p) => !seen.has(p.id));
  const pool = fresh.length ? fresh : bank;
  return pool[Math.floor(random() * pool.length)];
}
