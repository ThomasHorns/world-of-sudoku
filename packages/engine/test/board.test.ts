import { describe, expect, it } from 'vitest';
import {
  BOXES,
  CELL_UNITS,
  formatGrid,
  parseGrid,
  PEERS,
  sees,
  UNITS,
} from '../src';

describe('brettstruktur', () => {
  it('har 27 enheter med 9 ruter hver', () => {
    expect(UNITS).toHaveLength(27);
    for (const u of UNITS) expect(new Set(u).size).toBe(9);
  });

  it('gir hver rute 20 naboer', () => {
    for (const p of PEERS) expect(p).toHaveLength(20);
  });

  it('plasserer boks 5 (midten) riktig', () => {
    expect(BOXES[4]).toEqual([30, 31, 32, 39, 40, 41, 48, 49, 50]);
    expect(CELL_UNITS[40]).toEqual([4, 13, 22]);
  });

  it('sees() stemmer med naboer', () => {
    for (let a = 0; a < 81; a++) {
      for (let b = 0; b < 81; b++) expect(sees(a, b)).toBe(PEERS[a].includes(b));
    }
  });
});

describe('lesing og skriving', () => {
  it('godtar både 0 og . og går tur-retur', () => {
    const text = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
    const grid = parseGrid(text);
    expect(formatGrid(grid)).toBe(text.replace(/\./g, '0'));
  });

  it('avviser feil lengde og ugyldige tegn', () => {
    expect(() => parseGrid('123')).toThrow();
    expect(() => parseGrid('x'.repeat(81))).toThrow();
  });
});
