/**
 * Tips: forklarer neste logiske steg.
 *
 * Regel fra PLAN.md: har brettet feil tall, sier tipset bare at det finnes minst
 * én feil, uten å vise hvor. Tidsstraffen håndteres av appen, ikke her.
 */
import { Grid } from './board';
import { createState, findNextStep, Step } from './logic';
import { findErrors } from './validation';

export type Hint =
  | { kind: 'error' }
  | { kind: 'step'; step: Step }
  | { kind: 'none' };

/**
 * @param current  Brettet slik det står nå (utgangstall + spillerens tall, 0 = tom).
 * @param solution Fasiten.
 *
 * Merk: tipset bygger på tallene på brettet, ikke på spillerens egne notater.
 */
export function getHint(current: Grid, solution: Grid): Hint {
  if (findErrors(current, solution).length > 0) return { kind: 'error' };
  const step = findNextStep(createState(current), 5);
  return step ? { kind: 'step', step } : { kind: 'none' };
}
