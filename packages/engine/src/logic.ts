/**
 * Logisk løser som bruker menneskelige teknikker.
 *
 * Den samme koden brukes til tre ting:
 *  - gradering: hvilket nivå krever et brett (den vanskeligste teknikken som trengs)
 *  - generering: brett lages slik at de kan løses med teknikkene på målnivået
 *  - tips: neste logiske steg vises og forklares for spilleren
 *
 * Løseren bruker alltid den enkleste teknikken som gir fremgang.
 */
import {
  ALL_DIGITS_MASK,
  bit,
  BOXES,
  boxOf,
  CELL_COUNT,
  colOf,
  COLS,
  digitsOf,
  firstDigit,
  Grid,
  PEERS,
  popcount,
  rowOf,
  ROWS,
  sees,
  UNITS,
} from './board';

export type Level = 1 | 2 | 3 | 4 | 5;

export type TechniqueId =
  | 'fullHouse'
  | 'nakedSingle'
  | 'hiddenSingle'
  | 'pointing'
  | 'claiming'
  | 'nakedPair'
  | 'hiddenPair'
  | 'nakedTriple'
  | 'hiddenTriple'
  | 'xWing'
  | 'swordfish'
  | 'xyWing';

/** Hvilket nivå hver teknikk hører til (godkjent inndeling i PLAN.md). */
export const TECHNIQUE_LEVEL: Record<TechniqueId, Level> = {
  fullHouse: 1,
  nakedSingle: 1,
  hiddenSingle: 2,
  pointing: 3,
  claiming: 3,
  nakedPair: 3,
  hiddenPair: 3,
  nakedTriple: 4,
  hiddenTriple: 4,
  xWing: 4,
  swordfish: 5,
  xyWing: 5,
};

export interface CellDigit {
  cell: number;
  digit: number;
}

export interface Step {
  technique: TechniqueId;
  /** Tall som kan settes inn. */
  placements: CellDigit[];
  /** Kandidater som kan fjernes. */
  eliminations: CellDigit[];
  /** Rutene som utgjør mønsteret (for markering i tips). */
  patternCells: number[];
  /** Sifrene mønsteret gjelder. */
  digits: number[];
  /** Enhetene (rad/kolonne/boks) mønsteret ligger i, se UNITS. */
  units: number[];
}

export interface LogicState {
  values: number[];
  /** Kandidatmaske per rute. 0 for fylte ruter. */
  cands: number[];
}

/** Lager tilstand med alle kandidater som ikke er utelukket av tallene på brettet. */
export function createState(grid: Grid): LogicState {
  const values = grid.slice();
  const cands = new Array(CELL_COUNT).fill(0);
  for (let c = 0; c < CELL_COUNT; c++) {
    if (values[c] !== 0) continue;
    let mask = ALL_DIGITS_MASK;
    for (const p of PEERS[c]) if (values[p]) mask &= ~bit(values[p]);
    cands[c] = mask;
  }
  return { values, cands };
}

export function placeDigit(state: LogicState, cell: number, digit: number): void {
  state.values[cell] = digit;
  state.cands[cell] = 0;
  const b = ~bit(digit);
  for (const p of PEERS[cell]) state.cands[p] &= b;
}

export function applyStep(state: LogicState, step: Step): void {
  for (const { cell, digit } of step.eliminations) state.cands[cell] &= ~bit(digit);
  for (const { cell, digit } of step.placements) placeDigit(state, cell, digit);
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner

function emptyCells(state: LogicState, unit: number[]): number[] {
  return unit.filter((c) => state.values[c] === 0);
}

function cellsWithDigit(state: LogicState, unit: number[], digit: number): number[] {
  const b = bit(digit);
  return unit.filter((c) => state.cands[c] & b);
}

function combinations<T>(items: T[], k: number): T[][] {
  const out: T[][] = [];
  const pick: T[] = [];
  const rec = (start: number) => {
    if (pick.length === k) {
      out.push(pick.slice());
      return;
    }
    for (let i = start; i <= items.length - (k - pick.length); i++) {
      pick.push(items[i]);
      rec(i + 1);
      pick.pop();
    }
  };
  rec(0);
  return out;
}

function step(
  technique: TechniqueId,
  parts: Partial<Omit<Step, 'technique'>>,
): Step {
  return {
    technique,
    placements: parts.placements ?? [],
    eliminations: parts.eliminations ?? [],
    patternCells: parts.patternCells ?? [],
    digits: parts.digits ?? [],
    units: parts.units ?? [],
  };
}

// Rekkefølge for enheter når man leter: bokser først (lettest å se), så rader, så kolonner.
const UNIT_SEARCH_ORDER = [...Array(9).keys()]
  .map((i) => 18 + i)
  .concat([...Array(9).keys()], [...Array(9).keys()].map((i) => 9 + i));

// ---------------------------------------------------------------------------
// Nivå 1

/** Siste ledige rute i en rad, kolonne eller boks. */
function findFullHouse(state: LogicState): Step | null {
  for (const u of UNIT_SEARCH_ORDER) {
    const empties = emptyCells(state, UNITS[u]);
    if (empties.length !== 1) continue;
    const cell = empties[0];
    let used = 0;
    for (const c of UNITS[u]) if (state.values[c]) used |= bit(state.values[c]);
    const missing = ALL_DIGITS_MASK & ~used;
    if (popcount(missing) !== 1 || !(state.cands[cell] & missing)) continue;
    const digit = firstDigit(missing);
    return step('fullHouse', {
      placements: [{ cell, digit }],
      patternCells: [cell],
      digits: [digit],
      units: [u],
    });
  }
  return null;
}

/** Ruten har bare én mulig kandidat. */
function findNakedSingle(state: LogicState): Step | null {
  for (let cell = 0; cell < CELL_COUNT; cell++) {
    if (state.values[cell] === 0 && popcount(state.cands[cell]) === 1) {
      const digit = firstDigit(state.cands[cell]);
      return step('nakedSingle', {
        placements: [{ cell, digit }],
        patternCells: [cell],
        digits: [digit],
      });
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Nivå 2

/** Et siffer har bare én mulig plass i en rad, kolonne eller boks. */
function findHiddenSingle(state: LogicState): Step | null {
  for (const u of UNIT_SEARCH_ORDER) {
    for (let digit = 1; digit <= 9; digit++) {
      const cells = cellsWithDigit(state, UNITS[u], digit);
      if (cells.length === 1) {
        return step('hiddenSingle', {
          placements: [{ cell: cells[0], digit }],
          patternCells: cells,
          digits: [digit],
          units: [u],
        });
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Nivå 3

/** Pekende par/trippel: i en boks ligger alle plasser for et siffer i samme rad/kolonne. */
function findPointing(state: LogicState): Step | null {
  for (let b = 0; b < 9; b++) {
    for (let digit = 1; digit <= 9; digit++) {
      const cells = cellsWithDigit(state, BOXES[b], digit);
      if (cells.length < 2) continue;
      for (const kind of ['row', 'col'] as const) {
        const idx = kind === 'row' ? rowOf : colOf;
        const line = idx(cells[0]);
        if (!cells.every((c) => idx(c) === line)) continue;
        const lineCells = kind === 'row' ? ROWS[line] : COLS[line];
        const elims = lineCells
          .filter((c) => boxOf(c) !== b && state.cands[c] & bit(digit))
          .map((cell) => ({ cell, digit }));
        if (elims.length) {
          return step('pointing', {
            eliminations: elims,
            patternCells: cells,
            digits: [digit],
            units: [18 + b, kind === 'row' ? line : 9 + line],
          });
        }
      }
    }
  }
  return null;
}

/** Boks/linje-reduksjon: i en rad/kolonne ligger alle plasser for et siffer i samme boks. */
function findClaiming(state: LogicState): Step | null {
  for (let u = 0; u < 18; u++) {
    for (let digit = 1; digit <= 9; digit++) {
      const cells = cellsWithDigit(state, UNITS[u], digit);
      if (cells.length < 2) continue;
      const b = boxOf(cells[0]);
      if (!cells.every((c) => boxOf(c) === b)) continue;
      const inLine = new Set(UNITS[u]);
      const elims = BOXES[b]
        .filter((c) => !inLine.has(c) && state.cands[c] & bit(digit))
        .map((cell) => ({ cell, digit }));
      if (elims.length) {
        return step('claiming', {
          eliminations: elims,
          patternCells: cells,
          digits: [digit],
          units: [u, 18 + b],
        });
      }
    }
  }
  return null;
}

/** Åpent par/trippel: n ruter i en enhet som til sammen bare har n kandidater. */
function findNakedSubset(state: LogicState, n: 2 | 3): Step | null {
  const technique: TechniqueId = n === 2 ? 'nakedPair' : 'nakedTriple';
  for (const u of UNIT_SEARCH_ORDER) {
    const empties = emptyCells(state, UNITS[u]);
    if (empties.length <= n) continue;
    const pool = empties.filter((c) => {
      const k = popcount(state.cands[c]);
      return k >= 2 && k <= n;
    });
    for (const combo of combinations(pool, n)) {
      let union = 0;
      for (const c of combo) union |= state.cands[c];
      if (popcount(union) !== n) continue;
      const inCombo = new Set(combo);
      const elims: CellDigit[] = [];
      for (const c of empties) {
        if (inCombo.has(c)) continue;
        for (const d of digitsOf(state.cands[c] & union)) elims.push({ cell: c, digit: d });
      }
      if (elims.length) {
        return step(technique, {
          eliminations: elims,
          patternCells: combo,
          digits: digitsOf(union),
          units: [u],
        });
      }
    }
  }
  return null;
}

/** Skjult par/trippel: n siffer som i en enhet bare kan stå i de samme n rutene. */
function findHiddenSubset(state: LogicState, n: 2 | 3): Step | null {
  const technique: TechniqueId = n === 2 ? 'hiddenPair' : 'hiddenTriple';
  for (const u of UNIT_SEARCH_ORDER) {
    const unit = UNITS[u];
    const positions = new Map<number, number[]>();
    for (let d = 1; d <= 9; d++) {
      const cells = cellsWithDigit(state, unit, d);
      if (cells.length >= 2 && cells.length <= n) positions.set(d, cells);
    }
    for (const digits of combinations([...positions.keys()], n)) {
      const cellSet = new Set<number>();
      for (const d of digits) for (const c of positions.get(d)!) cellSet.add(c);
      if (cellSet.size !== n) continue;
      let keep = 0;
      for (const d of digits) keep |= bit(d);
      const cells = [...cellSet].sort((a, b) => a - b);
      const elims: CellDigit[] = [];
      for (const c of cells) {
        for (const d of digitsOf(state.cands[c] & ~keep)) elims.push({ cell: c, digit: d });
      }
      if (elims.length) {
        return step(technique, {
          eliminations: elims,
          patternCells: cells,
          digits,
          units: [u],
        });
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Nivå 4–5: fisk (X-Wing = 2, Swordfish = 3)

function findFish(state: LogicState, n: 2 | 3): Step | null {
  const technique: TechniqueId = n === 2 ? 'xWing' : 'swordfish';
  for (let digit = 1; digit <= 9; digit++) {
    const b = bit(digit);
    for (const orientation of ['row', 'col'] as const) {
      const baseLines = orientation === 'row' ? ROWS : COLS;
      const coverLines = orientation === 'row' ? COLS : ROWS;
      const crossIndex = orientation === 'row' ? colOf : rowOf;
      const candidates: { line: number; cross: number[] }[] = [];
      for (let line = 0; line < 9; line++) {
        const cells = baseLines[line].filter((c) => state.cands[c] & b);
        if (cells.length >= 2 && cells.length <= n) {
          candidates.push({ line, cross: cells.map(crossIndex) });
        }
      }
      for (const combo of combinations(candidates, n)) {
        const cover = new Set<number>();
        for (const x of combo) for (const k of x.cross) cover.add(k);
        if (cover.size !== n) continue;
        const baseSet = new Set(combo.map((x) => x.line));
        const elims: CellDigit[] = [];
        const patternCells: number[] = [];
        for (const k of cover) {
          for (const c of coverLines[k]) {
            if (!(state.cands[c] & b)) continue;
            const base = orientation === 'row' ? rowOf(c) : colOf(c);
            if (baseSet.has(base)) patternCells.push(c);
            else elims.push({ cell: c, digit });
          }
        }
        if (elims.length) {
          const baseUnits = combo.map((x) => (orientation === 'row' ? x.line : 9 + x.line));
          return step(technique, {
            eliminations: elims,
            patternCells: patternCells.sort((a, c) => a - c),
            digits: [digit],
            units: baseUnits,
          });
        }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Nivå 5: XY-Wing

function findXYWing(state: LogicState): Step | null {
  const bivalue = (c: number) => state.values[c] === 0 && popcount(state.cands[c]) === 2;
  for (let pivot = 0; pivot < CELL_COUNT; pivot++) {
    if (!bivalue(pivot)) continue;
    const pm = state.cands[pivot];
    const [x, y] = digitsOf(pm);
    const wings = PEERS[pivot].filter(bivalue);
    for (const a of wings) {
      const am = state.cands[a];
      // a = {x, z}
      if ((am & pm) !== bit(x)) continue;
      const z = firstDigit(am & ~bit(x));
      for (const c of wings) {
        if (c === a) continue;
        if (state.cands[c] !== (bit(y) | bit(z))) continue;
        const elims: CellDigit[] = [];
        for (let cell = 0; cell < CELL_COUNT; cell++) {
          if (cell === pivot || cell === a || cell === c) continue;
          if (!(state.cands[cell] & bit(z))) continue;
          if (sees(cell, a) && sees(cell, c)) elims.push({ cell, digit: z });
        }
        if (elims.length) {
          return step('xyWing', {
            eliminations: elims,
            patternCells: [pivot, a, c],
            digits: [x, y, z],
          });
        }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------

type Finder = (state: LogicState) => Step | null;

/** Teknikkene i rekkefølge fra enklest til vanskeligst. */
const FINDERS: { id: TechniqueId; find: Finder }[] = [
  { id: 'fullHouse', find: findFullHouse },
  { id: 'nakedSingle', find: findNakedSingle },
  { id: 'hiddenSingle', find: findHiddenSingle },
  { id: 'pointing', find: findPointing },
  { id: 'claiming', find: findClaiming },
  { id: 'nakedPair', find: (s) => findNakedSubset(s, 2) },
  { id: 'hiddenPair', find: (s) => findHiddenSubset(s, 2) },
  { id: 'nakedTriple', find: (s) => findNakedSubset(s, 3) },
  { id: 'hiddenTriple', find: (s) => findHiddenSubset(s, 3) },
  { id: 'xWing', find: (s) => findFish(s, 2) },
  { id: 'swordfish', find: (s) => findFish(s, 3) },
  { id: 'xyWing', find: findXYWing },
];

/** Neste logiske steg med den enkleste teknikken som gir fremgang, opp til `maxLevel`. */
export function findNextStep(state: LogicState, maxLevel: Level = 5): Step | null {
  for (const { id, find } of FINDERS) {
    if (TECHNIQUE_LEVEL[id] > maxLevel) continue;
    const s = find(state);
    if (s) return s;
  }
  return null;
}

/** Finn et steg med en bestemt teknikk (brukes i tester). */
export function findStepWith(state: LogicState, technique: TechniqueId): Step | null {
  return FINDERS.find((f) => f.id === technique)!.find(state);
}

export interface LogicResult {
  solved: boolean;
  /** Vanskeligste teknikk som ble brukt. 0 hvis brettet allerede var fullt. */
  level: Level | 0;
  steps: Step[];
  values: Grid;
}

/** Løser brettet logisk, med teknikker opp til `maxLevel`. */
export function solveLogically(grid: Grid, maxLevel: Level = 5): LogicResult {
  const state = createState(grid);
  const steps: Step[] = [];
  let level: Level | 0 = 0;
  while (state.values.includes(0)) {
    const s = findNextStep(state, maxLevel);
    if (!s) return { solved: false, level, steps, values: state.values };
    applyStep(state, s);
    steps.push(s);
    const l = TECHNIQUE_LEVEL[s.technique];
    if (l > level) level = l;
  }
  return { solved: true, level, steps, values: state.values };
}

