/**
 * Forklaringstekster for tips, på norsk og engelsk.
 * Appen kan bruke disse direkte eller erstatte dem med egne oversettelser.
 */
import { colOf, rowOf, unitKind, unitNumber } from './board';
import { Level, Step, TechniqueId } from './logic';

export type Lang = 'nb' | 'en';

export const TECHNIQUE_NAMES: Record<Lang, Record<TechniqueId, string>> = {
  nb: {
    fullHouse: 'Siste ledige rute',
    nakedSingle: 'Åpenbar singel',
    hiddenSingle: 'Skjult singel',
    pointing: 'Pekende par',
    claiming: 'Boks/linje-reduksjon',
    nakedPair: 'Åpent par',
    hiddenPair: 'Skjult par',
    nakedTriple: 'Åpen trippel',
    hiddenTriple: 'Skjult trippel',
    xWing: 'X-Wing',
    swordfish: 'Swordfish',
    xyWing: 'XY-Wing',
  },
  en: {
    fullHouse: 'Full house',
    nakedSingle: 'Naked single',
    hiddenSingle: 'Hidden single',
    pointing: 'Pointing pair',
    claiming: 'Box/line reduction',
    nakedPair: 'Naked pair',
    hiddenPair: 'Hidden pair',
    nakedTriple: 'Naked triple',
    hiddenTriple: 'Hidden triple',
    xWing: 'X-Wing',
    swordfish: 'Swordfish',
    xyWing: 'XY-Wing',
  },
};

export const LEVEL_NAMES: Record<Lang, Record<Level, string>> = {
  nb: { 1: 'Lett', 2: 'Middels', 3: 'Vanskelig', 4: 'Ekspert', 5: 'Mester' },
  en: { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Master' },
};

export const ERROR_HINT_TEXT: Record<Lang, string> = {
  nb: 'Det finnes minst én feil på brettet.',
  en: 'There is at least one mistake on the board.',
};

const WORDS = {
  nb: { row: 'rad', col: 'kolonne', box: 'boks', and: 'og' },
  en: { row: 'row', col: 'column', box: 'box', and: 'and' },
};

export function cellName(cell: number, lang: Lang): string {
  const w = WORDS[lang];
  return `${w.row} ${rowOf(cell) + 1}, ${w.col} ${colOf(cell) + 1}`;
}

export function unitName(unit: number, lang: Lang): string {
  return `${WORDS[lang][unitKind(unit)]} ${unitNumber(unit)}`;
}

function list(items: (string | number)[], lang: Lang): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${WORDS[lang].and} ${items[items.length - 1]}`;
}

function cells(cs: number[], lang: Lang): string {
  return list(cs.map((c) => `(${cellName(c, lang)})`), lang);
}

function elimSummary(s: Step, lang: Lang): string {
  const byDigit = new Map<number, number[]>();
  for (const e of s.eliminations) byDigit.set(e.digit, [...(byDigit.get(e.digit) ?? []), e.cell]);
  const parts = [...byDigit].map(([d, cs]) =>
    lang === 'nb'
      ? `${d} kan fjernes fra ${cells(cs, lang)}`
      : `${d} can be removed from ${cells(cs, lang)}`,
  );
  return list(parts, lang);
}

/** Forklaring av et steg i hele setninger. */
export function describeStep(s: Step, lang: Lang): string {
  const p = s.placements[0];
  const d = s.digits;
  const u = s.units.map((x) => unitName(x, lang));
  const nb = lang === 'nb';
  switch (s.technique) {
    case 'fullHouse':
      return nb
        ? `${cap(u[0])} har bare én ledig rute igjen. Det eneste tallet som mangler er ${p.digit}, så det må stå i (${cellName(p.cell, lang)}).`
        : `${cap(u[0])} has only one empty cell left. The only missing digit is ${p.digit}, so it goes in (${cellName(p.cell, lang)}).`;
    case 'nakedSingle':
      return nb
        ? `I (${cellName(p.cell, lang)}) er alle andre tall allerede brukt i samme rad, kolonne eller boks. Bare ${p.digit} er mulig.`
        : `In (${cellName(p.cell, lang)}) every other digit is already used in the same row, column or box. Only ${p.digit} is possible.`;
    case 'hiddenSingle':
      return nb
        ? `I ${u[0]} kan ${p.digit} bare stå i (${cellName(p.cell, lang)}).`
        : `In ${u[0]}, ${p.digit} can only go in (${cellName(p.cell, lang)}).`;
    case 'pointing':
      return nb
        ? `I ${u[0]} kan ${d[0]} bare stå i ${u[1]}. Da kan ${d[0]} ikke stå andre steder i ${u[1]}: ${elimSummary(s, lang)}.`
        : `In ${u[0]}, ${d[0]} can only be in ${u[1]}. So ${d[0]} cannot be elsewhere in ${u[1]}: ${elimSummary(s, lang)}.`;
    case 'claiming':
      return nb
        ? `I ${u[0]} kan ${d[0]} bare stå i ${u[1]}. Da kan ${d[0]} ikke stå andre steder i ${u[1]}: ${elimSummary(s, lang)}.`
        : `In ${u[0]}, ${d[0]} can only be in ${u[1]}. So ${d[0]} cannot be elsewhere in ${u[1]}: ${elimSummary(s, lang)}.`;
    case 'nakedPair':
    case 'nakedTriple':
      return nb
        ? `I ${u[0]} kan rutene ${cells(s.patternCells, lang)} bare inneholde ${list(d, lang)}. Disse tallene må stå der. Det betyr at ${elimSummary(s, lang)}.`
        : `In ${u[0]}, the cells ${cells(s.patternCells, lang)} can only hold ${list(d, lang)}. Those digits must go there, so ${elimSummary(s, lang)}.`;
    case 'hiddenPair':
    case 'hiddenTriple':
      return nb
        ? `I ${u[0]} kan ${list(d, lang)} bare stå i ${cells(s.patternCells, lang)}. Da kan disse rutene ikke ha andre tall: ${elimSummary(s, lang)}.`
        : `In ${u[0]}, ${list(d, lang)} can only go in ${cells(s.patternCells, lang)}. So those cells cannot hold other digits: ${elimSummary(s, lang)}.`;
    case 'xWing':
    case 'swordfish':
      return nb
        ? `I ${list(u, lang)} kan ${d[0]} bare stå i de samme ${s.units.length} ${unitKind(s.units[0]) === 'row' ? 'kolonnene' : 'radene'}. Det betyr at ${elimSummary(s, lang)}.`
        : `In ${list(u, lang)}, ${d[0]} can only be in the same ${s.units.length} ${unitKind(s.units[0]) === 'row' ? 'columns' : 'rows'}. Therefore ${elimSummary(s, lang)}.`;
    case 'xyWing': {
      const [pivot, a, c] = s.patternCells;
      const [x, y, z] = d;
      return nb
        ? `(${cellName(pivot, lang)}) er enten ${x} eller ${y}. Er den ${x}, blir (${cellName(a, lang)}) ${z}. Er den ${y}, blir (${cellName(c, lang)}) ${z}. Uansett blir én av dem ${z}. Det betyr at ${elimSummary(s, lang)}.`
        : `(${cellName(pivot, lang)}) is either ${x} or ${y}. If ${x}, (${cellName(a, lang)}) becomes ${z}. If ${y}, (${cellName(c, lang)}) becomes ${z}. Either way one of them is ${z}, so ${elimSummary(s, lang)}.`;
    }
  }
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
