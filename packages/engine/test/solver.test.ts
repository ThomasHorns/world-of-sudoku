import { describe, expect, it } from 'vitest';
import {
  countSolutions,
  createRng,
  emptyGrid,
  findConflicts,
  generateSolvedGrid,
  hasUniqueSolution,
  isComplete,
  solve,
} from '../src';
import { CLASSIC, CLASSIC_SOLUTION } from './fixtures';

describe('løser (backtracking)', () => {
  it('løser et kjent brett', () => {
    expect(solve(CLASSIC)).toEqual(CLASSIC_SOLUTION);
    expect(hasUniqueSolution(CLASSIC)).toBe(true);
  });

  it('ser at et tomt brett har flere løsninger', () => {
    expect(countSolutions(emptyGrid(), 2)).toBe(2);
  });

  it('gir 0 løsninger for et brett med konflikt', () => {
    const g = CLASSIC.slice();
    g[2] = 5; // 5 står allerede i rad 1
    expect(countSolutions(g)).toBe(0);
    expect(solve(g)).toBeNull();
  });

  it('lager gyldige, varierte ferdige brett', () => {
    const rng = createRng(42);
    const a = generateSolvedGrid(rng);
    const b = generateSolvedGrid(rng);
    for (const g of [a, b]) {
      expect(isComplete(g)).toBe(true);
      expect(findConflicts(g)).toEqual([]);
    }
    expect(a).not.toEqual(b);
  });

  it('er deterministisk med samme frø', () => {
    expect(generateSolvedGrid(createRng(7))).toEqual(generateSolvedGrid(createRng(7)));
  });
});
