import { describe, expect, it } from 'vitest';
import {
  describeStep,
  ERROR_HINT_TEXT,
  getHint,
  LEVEL_NAMES,
  solveLogically,
  TECHNIQUE_NAMES,
  createRng,
  generatePuzzle,
  Level,
  Step,
} from '../src';
import { CLASSIC, CLASSIC_SOLUTION } from './fixtures';

describe('tips', () => {
  it('sier bare at det finnes en feil når brettet har feil tall', () => {
    const g = CLASSIC.slice();
    g[2] = 1; // feil
    expect(getHint(g, CLASSIC_SOLUTION)).toEqual({ kind: 'error' });
  });

  it('gir et logisk steg som stemmer med fasiten', () => {
    const hint = getHint(CLASSIC, CLASSIC_SOLUTION);
    expect(hint.kind).toBe('step');
    if (hint.kind !== 'step') return;
    for (const p of hint.step.placements) expect(p.digit).toBe(CLASSIC_SOLUTION[p.cell]);
  });

  it('gir ingen tips på et løst brett', () => {
    expect(getHint(CLASSIC_SOLUTION, CLASSIC_SOLUTION)).toEqual({ kind: 'none' });
  });
});

describe('forklaringstekster', () => {
  it('har navn for alle teknikker og nivåer på begge språk', () => {
    for (const lang of ['nb', 'en'] as const) {
      for (const name of Object.values(TECHNIQUE_NAMES[lang])) expect(name).toBeTruthy();
      for (const l of [1, 2, 3, 4, 5] as Level[]) expect(LEVEL_NAMES[lang][l]).toBeTruthy();
      expect(ERROR_HINT_TEXT[lang]).toBeTruthy();
    }
  });

  it('beskriver hvert steg i ekte brett uten tomme felter', () => {
    const steps: Step[] = [];
    for (const level of [3, 4, 5] as Level[]) {
      const rng = createRng(77 + level);
      for (let i = 0; i < 3; i++) steps.push(...solveLogically(generatePuzzle(level, rng)!.puzzle).steps);
    }
    for (const s of steps) {
      for (const lang of ['nb', 'en'] as const) {
        const text = describeStep(s, lang);
        expect(text.length).toBeGreaterThan(20);
        expect(text).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it('skriver rutenavn som rad og kolonne', () => {
    const hint = getHint(CLASSIC, CLASSIC_SOLUTION);
    if (hint.kind !== 'step') throw new Error('forventet steg');
    expect(describeStep(hint.step, 'nb')).toMatch(/rad \d, kolonne \d/);
    expect(describeStep(hint.step, 'en')).toMatch(/row \d, column \d/);
  });
});
