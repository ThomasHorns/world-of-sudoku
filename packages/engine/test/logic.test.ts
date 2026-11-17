import { describe, expect, it } from 'vitest';
import {
  applyStep,
  createRng,
  countGivens,
  createState,
  findNextStep,
  generatePuzzle,
  GIVENS_RANGE,
  gradePuzzle,
  Level,
  solve,
  solveLogically,
  TECHNIQUE_LEVEL,
  TechniqueId,
} from '../src';
import { CLASSIC, CLASSIC_SOLUTION } from './fixtures';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

/** Brett per nivå laget med fast frø, delt av testene under. */
const SAMPLES = LEVELS.flatMap((level) => {
  const rng = createRng(1000 + level);
  return Array.from({ length: 6 }, () => generatePuzzle(level, rng)!);
});

describe('logisk løser', () => {
  it('løser et kjent brett og får samme svar som backtracking', () => {
    const r = solveLogically(CLASSIC);
    expect(r.solved).toBe(true);
    expect(r.values).toEqual(CLASSIC_SOLUTION);
  });

  it('gjør bare riktige trekk (testet på brett fra alle nivåer)', () => {
    // Det viktigste kravet til teknikkene: et tall som settes inn må stemme med
    // fasiten, og en kandidat som fjernes må aldri være den riktige.
    for (const { puzzle, solution } of SAMPLES) {
      const state = createState(puzzle);
      for (;;) {
        const s = findNextStep(state, 5);
        if (!s) break;
        for (const p of s.placements) expect(p.digit).toBe(solution[p.cell]);
        for (const e of s.eliminations) expect(e.digit).not.toBe(solution[e.cell]);
        expect(s.placements.length + s.eliminations.length).toBeGreaterThan(0);
        applyStep(state, s);
      }
      expect(state.values).toEqual(solution);
    }
  });

  it('respekterer maksnivå', () => {
    for (const { puzzle, level } of SAMPLES) {
      if (level === 1) continue;
      const r = solveLogically(puzzle, (level - 1) as Level);
      expect(r.solved).toBe(false);
      for (const s of r.steps) expect(TECHNIQUE_LEVEL[s.technique]).toBeLessThan(level);
    }
  });
});

describe('generering og gradering', () => {
  it('lager brett som graderes til riktig nivå og har én løsning', () => {
    for (const { puzzle, solution, level } of SAMPLES) {
      const g = gradePuzzle(puzzle);
      expect(g.unique).toBe(true);
      expect(g.solvableByLogic).toBe(true);
      expect(g.level).toBe(level);
      expect(solve(puzzle)).toEqual(solution);
      const [min, max] = GIVENS_RANGE[level];
      expect(countGivens(puzzle)).toBeGreaterThanOrEqual(min);
      expect(countGivens(puzzle)).toBeLessThanOrEqual(max);
    }
  });

  it('bruker teknikker fra alle nivåer i utvalget', () => {
    const seen = new Set<TechniqueId>();
    for (const { puzzle } of SAMPLES) {
      for (const s of solveLogically(puzzle).steps) seen.add(s.technique);
    }
    for (const level of LEVELS) {
      const ids = (Object.keys(TECHNIQUE_LEVEL) as TechniqueId[]).filter(
        (id) => TECHNIQUE_LEVEL[id] === level,
      );
      expect(ids.some((id) => seen.has(id))).toBe(true);
    }
  });
});
