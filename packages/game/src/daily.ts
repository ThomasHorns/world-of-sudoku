/**
 * Dagens brett: samme brett for alle samme dag. Nivået skifter med ukedagen.
 */
import { Level } from '../../engine/src';

/**
 * Nivå per ukedag (Date.getDay(): 0 = søndag).
 * Fordelingen er satt 17.11 og kan justeres.
 */
export const DAILY_LEVEL_BY_WEEKDAY: Record<number, Level> = {
  1: 1, // mandag: Lett
  2: 2, // tirsdag: Middels
  3: 3, // onsdag: Vanskelig
  4: 4, // torsdag: Ekspert
  5: 3, // fredag: Vanskelig
  6: 5, // lørdag: Mester
  0: 4, // søndag: Ekspert
};

/** Lokal dato som ÅÅÅÅ-MM-DD. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dailyLevel(key: string): Level {
  const [y, m, d] = key.split('-').map(Number);
  return DAILY_LEVEL_BY_WEEKDAY[new Date(y, m - 1, d).getDay()];
}

/** FNV-1a – gir samme tall for samme dato på alle enheter. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Hvilket brett i nivåets bank som er dagens brett. */
export function dailyIndex(key: string, bankSize: number): number {
  return hash(`wos-daily-${key}`) % bankSize;
}
