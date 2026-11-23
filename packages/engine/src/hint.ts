/**
 * Tips: forklarer neste logiske steg.
 *
 * Regel fra PLAN.md: har brettet feil tall, sier tipset bare at det finnes minst
 * én feil, uten å vise hvor. Tidsstraffen håndteres av appen, ikke her.
 *
 * Tipset tar hensyn til spillerens notater: i en rute med notater regnes bare de
 * noterte sifrene som mulige. Da foreslår tipset aldri å fjerne et notat som
 * allerede er borte. Mangler notatene i en rute det riktige tallet, peker tipset
 * på ruten, siden tips som bygger på en slik feil kan bli gale.
 */
import { bit, Grid } from './board';
import { applyStep, createState, findNextStep, LogicState, Step } from './logic';
import { findErrors } from './validation';

export type Hint =
  | { kind: 'error' }
  | { kind: 'noteError'; cells: number[] }
  | { kind: 'step'; step: Step }
  | { kind: 'none' };

/** Ruter der notatene mangler det riktige tallet (bare tomme ruter med notater). */
export function findNoteErrors(current: Grid, solution: Grid, notes: readonly number[]): number[] {
  const cells: number[] = [];
  for (let c = 0; c < current.length; c++) {
    if (current[c] === 0 && notes[c] && !(notes[c] & bit(solution[c]))) cells.push(c);
  }
  return cells;
}

/** Kandidater ut fra tallene på brettet, begrenset til spillerens notater der det finnes notater. */
export function createHintState(current: Grid, notes?: readonly number[]): LogicState {
  const state = createState(current);
  if (notes) {
    for (let c = 0; c < state.cands.length; c++) {
      if (state.cands[c] && notes[c]) state.cands[c] &= notes[c];
    }
  }
  return state;
}

/**
 * @param current  Brettet slik det står nå (utgangstall + spillerens tall, 0 = tom).
 * @param solution Fasiten.
 * @param notes    Spillerens notater som bitmaske per rute (valgfritt).
 * @param skip     Antall tips som allerede er vist for denne stillingen. Ved nytt trykk
 *                 uten endringer later motoren som om de forrige tipsene er utført, og
 *                 viser neste steg.
 */
export function getHint(current: Grid, solution: Grid, notes?: readonly number[], skip = 0): Hint {
  if (findErrors(current, solution).length > 0) return { kind: 'error' };
  if (notes) {
    const cells = findNoteErrors(current, solution, notes);
    if (cells.length > 0) return { kind: 'noteError', cells };
  }
  const state = createHintState(current, notes);
  let step = findNextStep(state, 5);
  for (let i = 0; i < skip && step; i++) {
    applyStep(state, step);
    step = findNextStep(state, 5);
  }
  return step ? { kind: 'step', step } : { kind: 'none' };
}
