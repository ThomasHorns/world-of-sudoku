import { describe, expect, it } from 'vitest';
import {
  emptyGrid,
  findConflicts,
  findErrors,
  isComplete,
  isCorrectEntry,
  isSolved,
  submitGrid,
} from '../src';
import { CLASSIC, CLASSIC_SOLUTION } from './fixtures';

describe('validering', () => {
  it('finner ingen konflikter i et gyldig brett', () => {
    expect(findConflicts(CLASSIC)).toEqual([]);
    expect(findConflicts(CLASSIC_SOLUTION)).toEqual([]);
  });

  it('finner to like tall i samme rad', () => {
    const g = emptyGrid();
    g[0] = 5;
    g[8] = 5;
    expect(findConflicts(g)).toEqual([0, 8]);
  });

  it('skiller tomme ruter fra feil', () => {
    const g = CLASSIC.slice();
    g[2] = 4; // riktig er 4
    g[3] = 1; // riktig er 6
    expect(findErrors(g, CLASSIC_SOLUTION)).toEqual([3]);
    expect(isCorrectEntry(2, 4, CLASSIC_SOLUTION)).toBe(true);
    expect(isCorrectEntry(3, 1, CLASSIC_SOLUTION)).toBe(false);
  });

  it('kjenner igjen løst brett', () => {
    expect(isComplete(CLASSIC)).toBe(false);
    expect(isSolved(CLASSIC_SOLUTION, CLASSIC_SOLUTION)).toBe(true);
  });
});

describe('Lever brett', () => {
  it('kan ikke leveres før brettet er fullt', () => {
    expect(submitGrid(CLASSIC, CLASSIC_SOLUTION)).toEqual({ status: 'incomplete' });
  });

  it('godtar riktig brett', () => {
    expect(submitGrid(CLASSIC_SOLUTION, CLASSIC_SOLUTION)).toEqual({ status: 'correct' });
  });

  it('viser hvilke ruter som er feil', () => {
    const g = CLASSIC_SOLUTION.slice();
    [g[2], g[3]] = [g[3], g[2]];
    expect(submitGrid(g, CLASSIC_SOLUTION)).toEqual({ status: 'wrong', errors: [2, 3] });
  });
});
