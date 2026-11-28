import { describe, expect, it } from 'vitest';
import {
  PEERS,
  bit,
  createState,
  describeNoteConflict,
  describeStep,
  ERROR_HINT_TEXT,
  getHint,
  hintKey,
  hintKeyOf,
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

describe('tips og notater', () => {
  /** Trykker på tips til et tips gjentas, slik appen gjør (husker viste tips). */
  function pressUntilRepeat(grid: number[], max = 500) {
    const shown = new Set<string>();
    const keys: string[] = [];
    for (let i = 0; i < max; i++) {
      const hint = getHint(grid, CLASSIC_SOLUTION, undefined, shown);
      if (hint.kind !== 'step') throw new Error('ventet et tips');
      const key = hintKey(hint.step);
      keys.push(key);
      if (shown.has(key)) return keys;
      shown.add(key);
    }
    throw new Error('tipsene gjentok seg aldri');
  }

  it('gjentar ikke et tips før alle andre tips er vist', () => {
    const keys = pressUntilRepeat(CLASSIC.slice());
    const distinct = keys.slice(0, -1);
    expect(distinct.length).toBeGreaterThan(1);
    expect(new Set(distinct).size).toBe(distinct.length);
    // Når alt er vist, kommer det enkleste tipset først igjen.
    expect(keys[keys.length - 1]).toBe(keys[0]);
  });

  it('viser ikke det samme tipset igjen etter at spilleren har satt inn et tall et annet sted', () => {
    const grid = CLASSIC.slice();
    const shown = new Set<string>();
    const first = getHint(grid, CLASSIC_SOLUTION, undefined, shown);
    if (first.kind !== 'step') throw new Error('ventet et tips');
    shown.add(hintKey(first.step));
    const hinted = new Set([...first.step.patternCells, ...first.step.placements.map((p) => p.cell)]);
    // Spilleren fyller en annen tom rute riktig i stedet for å følge tipset.
    const other = grid.findIndex((v, c) => v === 0 && !hinted.has(c));
    grid[other] = CLASSIC_SOLUTION[other];
    const second = getHint(grid, CLASSIC_SOLUTION, undefined, shown);
    if (second.kind !== 'step') throw new Error('ventet et tips');
    expect(hintKey(second.step)).not.toBe(hintKey(first.step));
  });

  it('hvert tips gjelder brettet slik det står nå', () => {
    const shown = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const hint = getHint(CLASSIC, CLASSIC_SOLUTION, undefined, shown);
      if (hint.kind !== 'step') break;
      shown.add(hintKey(hint.step));
      // Tallene som foreslås er riktige, og rutene er tomme.
      for (const p of hint.step.placements) {
        expect(CLASSIC[p.cell]).toBe(0);
        expect(p.digit).toBe(CLASSIC_SOLUTION[p.cell]);
      }
      // Kandidatene som foreslås fjernet, er faktisk mulige nå og er ikke fasiten.
      const now = createState(CLASSIC);
      for (const e of hint.step.eliminations) {
        expect(now.cands[e.cell] & bit(e.digit)).not.toBe(0);
        expect(e.digit).not.toBe(CLASSIC_SOLUTION[e.cell]);
      }
    }
  });

  it('feil tall går foran alt annet', () => {
    const g = CLASSIC.slice();
    const wrong = g.findIndex((v) => v === 0);
    g[wrong] = CLASSIC_SOLUTION[wrong] === 1 ? 2 : 1;
    expect(getHint(g, CLASSIC_SOLUTION, new Array(81).fill(0))).toEqual({ kind: 'error' });
  });

  it('notater er påminnelser: delvise eller ufullstendige notater endrer ikke tipset', () => {
    const plain = getHint(CLASSIC, CLASSIC_SOLUTION);
    // Spilleren har bare notert ett tall i noen ruter, og ikke alltid det riktige.
    const notes = new Array(81).fill(0);
    const cands = createState(CLASSIC).cands;
    for (let c = 0; c < 81; c += 7) {
      if (CLASSIC[c] !== 0) continue;
      const wrong = cands[c] & ~bit(CLASSIC_SOLUTION[c]);
      notes[c] = wrong ? wrong & -wrong : bit(CLASSIC_SOLUTION[c]);
    }
    expect(getHint(CLASSIC, CLASSIC_SOLUTION, notes)).toEqual(plain);
  });

  it('peker ut et notat som strider mot et tall i samme rad, kolonne eller boks', () => {
    const cell = CLASSIC.findIndex((v) => v === 0);
    const source = PEERS[cell].find((p) => CLASSIC[p] !== 0)!;
    const digit = CLASSIC[source];
    const notes = new Array(81).fill(0);
    notes[cell] = bit(digit) | bit(CLASSIC_SOLUTION[cell]);
    const hint = getHint(CLASSIC, CLASSIC_SOLUTION, notes);
    expect(hint).toMatchObject({ kind: 'noteConflict', cell, digit, source });
    if (hint.kind !== 'noteConflict') throw new Error();
    expect(describeNoteConflict(hint, 'nb')).toContain(`Notatet ${digit} i (rad `);
    expect(describeNoteConflict(hint, 'nb')).toContain(`kan fjernes: ${digit} står allerede i (rad `);
    expect(describeNoteConflict(hint, 'en')).toMatch(/can be removed/);
    // Neste trykk gir et vanlig tips.
    const next = getHint(CLASSIC, CLASSIC_SOLUTION, notes, new Set([hintKeyOf(hint)!]));
    expect(next.kind).toBe('step');
  });

  it('sier hvilke notater som kan fjernes, og bare notater spilleren har', () => {
    // Finn et tips som utelukker tall, og noter ett av dem.
    for (const seed of [21, 22, 23, 24, 25, 26]) {
      const { puzzle, solution } = generatePuzzle(4, createRng(seed))!;
      const shown = new Set<string>();
      for (let i = 0; i < 300; i++) {
        const hint = getHint(puzzle, solution, undefined, shown);
        if (hint.kind !== 'step') break;
        shown.add(hintKeyOf(hint)!);
        if (hint.step.eliminations.length === 0) continue;
        const e = hint.step.eliminations[0];
        const notes = new Array(81).fill(0);
        notes[e.cell] = bit(e.digit);
        const nb = describeStep(hint.step, 'nb', notes, hint.builtOn);
        expect(nb).toContain(`Du kan fjerne notatet ${e.digit} i (`);
        expect(nb).toMatch(/kan ikke stå i/);
        expect(describeStep(hint.step, 'nb', new Array(81).fill(0))).not.toMatch(/Du kan fjerne/);
        return;
      }
    }
    throw new Error('fant ikke noe tips som utelukker tall');
  });

  /**
   * Spiller som bare setter inn tall (noterer ingenting) og trykker på tips når hen står fast.
   * Viste utelukkelser skal tipsene bygge videre på, så brettet blir løst også på høye nivåer.
   */
  function solveWithHints(level: Level, seed: number) {
    const { puzzle, solution } = generatePuzzle(level, createRng(seed))!;
    const grid = puzzle.slice();
    const shown = new Set<string>();
    let builtOn = 0;
    for (let i = 0; i < 2000 && grid.includes(0); i++) {
      const hint = getHint(grid, solution, undefined, shown);
      if (hint.kind !== 'step') throw new Error('ventet et tips');
      const key = hintKeyOf(hint)!;
      if (shown.has(key)) shown.clear();
      shown.add(key);
      if (hint.builtOn.length > 0) builtOn++;
      // Alt tipset sier, stemmer med fasiten.
      for (const p of hint.step.placements) expect(p.digit).toBe(solution[p.cell]);
      for (const e of hint.step.eliminations) expect(e.digit).not.toBe(solution[e.cell]);
      for (const e of hint.builtOn) expect(e.digit).not.toBe(solution[e.cell]);
      for (const p of hint.step.placements) grid[p.cell] = p.digit;
    }
    return { solved: !grid.includes(0), builtOn };
  }

  it('fører fram til løsningen og bygger på tidligere tips når det trengs', () => {
    let builtOn = 0;
    for (const level of [3, 4, 5] as Level[]) {
      for (const seed of [31, 32]) {
        const r = solveWithHints(level, seed * 10 + level);
        expect(r.solved).toBe(true);
        builtOn += r.builtOn;
      }
    }
    expect(builtOn).toBeGreaterThan(0);
  });

  it('forteller i teksten når et tips bygger på tidligere tips', () => {
    for (const seed of [41, 42, 43, 44, 45]) {
      const { puzzle, solution } = generatePuzzle(5, createRng(seed))!;
      const grid = puzzle.slice();
      const shown = new Set<string>();
      for (let i = 0; i < 2000 && grid.includes(0); i++) {
        const hint = getHint(grid, solution, undefined, shown);
        if (hint.kind !== 'step') break;
        shown.add(hintKeyOf(hint)!);
        if (hint.builtOn.length > 0) {
          expect(describeStep(hint.step, 'nb', undefined, hint.builtOn)).toMatch(/bygger på tidligere tips/);
          expect(describeStep(hint.step, 'en', undefined, hint.builtOn)).toMatch(/builds on earlier hints/);
          return;
        }
        for (const p of hint.step.placements) grid[p.cell] = p.digit;
      }
    }
    throw new Error('fant ikke noe tips som bygger på tidligere tips');
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
