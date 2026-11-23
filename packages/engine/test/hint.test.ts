import { describe, expect, it } from 'vitest';
import {
  applyStep,
  bit,
  createState,
  describeNoteError,
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

describe('tips med notater', () => {
  /** Spiller som følger hvert tips: fjerner notater og setter inn tall slik tipset sier. */
  function followHints(level: Level, seed: number, rounds: number) {
    const { puzzle, solution } = generatePuzzle(level, createRng(seed))!;
    const s = createState(puzzle); // spilleren har notert alle mulige kandidater
    const shown: Step[] = [];
    for (let i = 0; i < rounds; i++) {
      const hint = getHint(s.values, solution, s.cands);
      if (hint.kind !== 'step') break;
      shown.push(hint.step);
      // Hvert forslag om å fjerne et notat gjelder et notat som faktisk finnes.
      for (const e of hint.step.eliminations) expect(s.cands[e.cell] & bit(e.digit)).not.toBe(0);
      applyStep(s, hint.step);
    }
    return shown;
  }

  it('foreslår aldri å fjerne et notat som allerede er borte, og går videre når spilleren følger tipset', () => {
    let eliminationSteps = 0;
    for (const level of [3, 4, 5] as Level[]) {
      for (const seed of [11, 12, 13]) {
        const steps = followHints(level, seed * 10 + level, 200);
        eliminationSteps += steps.filter((st) => st.placements.length === 0).length;
        // Ingen tips gjentas: hvert tips gjør noe nytt.
        const keys = steps.map((st) => JSON.stringify([st.technique, st.placements, st.eliminations]));
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
    expect(eliminationSteps).toBeGreaterThan(0); // testen dekker tips som bare fjerner notater
  });

  it('bruker notatene: et notat spilleren har fjernet blir ikke foreslått fjernet igjen', () => {
    // Finn et tips som bare fjerner kandidater, fjern de notatene selv, og spør igjen.
    for (const seed of [21, 22, 23, 24, 25]) {
      const { puzzle, solution } = generatePuzzle(4, createRng(seed))!;
      const s = createState(puzzle);
      for (let i = 0; i < 200; i++) {
        const hint = getHint(s.values, solution, s.cands);
        if (hint.kind !== 'step') break;
        if (hint.step.placements.length === 0) {
          const before = getHint(s.values, solution); // uten notater: samme tips
          expect(before.kind === 'step' && before.step.eliminations).toBeTruthy();
          for (const e of hint.step.eliminations) s.cands[e.cell] &= ~bit(e.digit);
          const after = getHint(s.values, solution, s.cands);
          if (after.kind === 'step') {
            expect(JSON.stringify(after.step.eliminations)).not.toBe(JSON.stringify(hint.step.eliminations));
          }
          return;
        }
        applyStep(s, hint.step);
      }
    }
    throw new Error('fant ikke noe tips som bare fjerner kandidater');
  });

  it('viser neste tips når spilleren trykker igjen uten å endre noe', () => {
    const first = getHint(CLASSIC, CLASSIC_SOLUTION, undefined, 0);
    const second = getHint(CLASSIC, CLASSIC_SOLUTION, undefined, 1);
    expect(first.kind).toBe('step');
    expect(second.kind).toBe('step');
    expect(second).not.toEqual(first);
  });

  it('peker på ruten når notatene mangler det riktige tallet', () => {
    const cell = CLASSIC.findIndex((v) => v === 0);
    const notes = new Array(81).fill(0);
    notes[cell] = 0b111111111 & ~bit(CLASSIC_SOLUTION[cell]);
    expect(getHint(CLASSIC, CLASSIC_SOLUTION, notes)).toEqual({ kind: 'noteError', cells: [cell] });
    expect(describeNoteError([cell], 'nb')).toMatch(/rad \d, kolonne \d/);
    expect(describeNoteError([cell], 'en')).toMatch(/row \d, column \d/);
  });

  it('feil tall går foran feil i notatene', () => {
    const g = CLASSIC.slice();
    const wrong = g.findIndex((v) => v === 0);
    g[wrong] = CLASSIC_SOLUTION[wrong] === 1 ? 2 : 1;
    const notes = new Array(81).fill(0);
    const other = g.findIndex((v, i) => v === 0 && i !== wrong);
    notes[other] = 0b111111111 & ~bit(CLASSIC_SOLUTION[other]);
    expect(getHint(g, CLASSIC_SOLUTION, notes)).toEqual({ kind: 'error' });
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
