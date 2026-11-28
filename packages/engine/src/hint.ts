/**
 * Tips: forklarer neste logiske steg, med bevis i teksten.
 *
 * Regler (PLAN.md og ønsker fra testing 27.11.2026):
 *  - Har brettet feil tall, sier tipset bare at det finnes minst én feil, uten å vise hvor.
 *  - Notater er påminnelser, ikke fulle lister. Tipsene trekker aldri slutninger fra tall
 *    spilleren ikke har notert. Alt som foreslås, bevises ut fra tallene på brettet
 *    (og tidligere viste tips, som da nevnes i teksten).
 *  - Et notat som strider mot et tall i samme rad, kolonne eller boks, kan fjernes.
 *  - Enkleste tips først. Et tips gjentas ikke før alle andre tips er vist.
 * Tidsstraffen håndteres av appen, ikke her.
 */
import { bit, Grid, PEERS, UNITS } from './board';
import { applyStep, CellDigit, createState, findNextStep, Step } from './logic';
import { findErrors } from './validation';

export type Hint =
  | { kind: 'error' }
  /** Notatet `digit` i `cell` strider mot tallet i `source` (samme enhet `unit`). */
  | { kind: 'noteConflict'; cell: number; digit: number; source: number; unit: number }
  /** `builtOn`: utelukkelser fra tidligere viste tips som dette steget bygger på. */
  | { kind: 'step'; step: Step; builtOn: CellDigit[] }
  | { kind: 'none' };

/** Notater som strider mot et tall i samme rad, kolonne eller boks. */
export function findNoteConflicts(
  current: Grid,
  notes: readonly number[],
): Extract<Hint, { kind: 'noteConflict' }>[] {
  const out: Extract<Hint, { kind: 'noteConflict' }>[] = [];
  for (let cell = 0; cell < current.length; cell++) {
    if (current[cell] !== 0 || !notes[cell]) continue;
    for (let digit = 1; digit <= 9; digit++) {
      if (!(notes[cell] & bit(digit))) continue;
      const source = PEERS[cell].find((p) => current[p] === digit);
      if (source === undefined) continue;
      const unit = UNITS.findIndex((u) => u.includes(cell) && u.includes(source));
      out.push({ kind: 'noteConflict', cell, digit, source, unit });
    }
  }
  return out;
}

/**
 * Fast nøkkel for et steg: teknikk, mønsterruter, sifre og tall som settes inn.
 * Fjernede kandidater er ikke med, så tipset regnes som det samme selv om noen av
 * dem allerede er borte.
 */
export function hintKey(step: Step): string {
  const cells = [...step.patternCells].sort((a, b) => a - b).join(',');
  const placed = step.placements.map((p) => `${p.cell}=${p.digit}`).join(',');
  return `${step.technique}|${cells}|${step.digits.join(',')}|${placed}`;
}

/** Fast nøkkel for et hvilket som helst tips (null for «ingen tips»). */
export function hintKeyOf(hint: Hint): string | null {
  switch (hint.kind) {
    case 'step':
      return hintKey(hint.step);
    case 'noteConflict':
      return `noteConflict|${hint.cell}|${hint.digit}`;
    case 'error':
      return 'error';
    default:
      return null;
  }
}

/** Tidligere utelukkelser som gjelder rutene og sifrene steget bygger på. */
function relevantEliminations(step: Step, applied: CellDigit[]): CellDigit[] {
  const placed = new Set(step.placements.map((p) => p.cell));
  const pattern = new Set(step.patternCells);
  const unitCells = new Set(step.units.flatMap((u) => UNITS[u]));
  return applied.filter(
    (e) =>
      pattern.has(e.cell) ||
      (placed.has(e.cell) && step.technique === 'nakedSingle') ||
      (unitCells.has(e.cell) && step.digits.includes(e.digit)),
  );
}

/**
 * @param current  Brettet slik det står nå (utgangstall + spillerens tall, 0 = tom).
 * @param solution Fasiten.
 * @param notes    Spillerens notater som bitmaske per rute (valgfritt). Brukes bare til å
 *                 finne notater som strider mot tall på brettet; logikken bygger på brettet.
 * @param shown    Nøkler (hintKeyOf) for tips som allerede er vist i spillet. Tipset velger
 *                 et tips som ikke er vist ennå. Viste tips som utelukker tall, regnes som
 *                 kjent, så neste tips kan bygge videre på dem. Når alle mulige tips er vist,
 *                 begynner rekken på nytt.
 */
export function getHint(
  current: Grid,
  solution: Grid,
  notes?: readonly number[],
  shown?: ReadonlySet<string>,
): Hint {
  if (findErrors(current, solution).length > 0) return { kind: 'error' };
  const seen = (key: string | null) => key !== null && !!shown?.has(key);

  const conflicts = notes ? findNoteConflicts(current, notes) : [];
  const freshConflict = conflicts.find((h) => !seen(hintKeyOf(h)));
  if (freshConflict) return freshConflict;

  const state = createState(current);
  const applied: CellDigit[] = [];
  // Viste tips som setter inn tall, hoppes over (spilleren har ikke fulgt dem ennå).
  // Viste tips som bare utelukker tall, legges til grunn, og søket går videre.
  const skipShownPlacement = (s: Step) => !(s.placements.length > 0 && seen(hintKey(s)));
  for (let guard = 0; guard < 500; guard++) {
    const step = findNextStep(state, 5, skipShownPlacement);
    if (!step) break;
    if (!seen(hintKey(step))) return { kind: 'step', step, builtOn: relevantEliminations(step, applied) };
    applyStep(state, step);
    applied.push(...step.eliminations);
  }

  // Alle tips er vist: begynn på nytt med det enkleste.
  if (conflicts.length > 0) return conflicts[0];
  const first = findNextStep(createState(current), 5);
  return first ? { kind: 'step', step: first, builtOn: [] } : { kind: 'none' };
}
