/**
 * Tekster på norsk og engelsk.
 * Språket følger telefonen (norsk hvis telefonen er på norsk, ellers engelsk),
 * men kan endres i innstillinger.
 */
import { getLocales } from 'expo-localization';
import type { Lang } from '../../packages/engine/src';

export type LanguageSetting = 'auto' | Lang;

export function deviceLanguage(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return ['nb', 'no', 'nn'].includes(code) ? 'nb' : 'en';
}

export function resolveLanguage(setting: LanguageSetting): Lang {
  return setting === 'auto' ? deviceLanguage() : setting;
}

const nb = {
  dailyPuzzle: 'Dagens brett',
  dailyDone: 'Løst på {time}',
  dailyPlay: 'Spill dagens brett',
  levels: 'Nivåer',
  continue: 'Fortsett',
  stats: 'Statistikk',
  settings: 'Innstillinger',
  back: 'Tilbake',
  home: 'Hjem',
  autoCheck: 'Auto-sjekk',
  autoCheckOn: 'Feil tall blir røde med en gang og gir {penalty} s straff.',
  autoCheckOff: 'Ingen sjekk underveis. Du leverer brettet når det er fullt, og leveringen er endelig.',
  autoCheckLocked: 'Valget kan ikke endres etter at spillet har startet.',
  start: 'Start',
  cancel: 'Avbryt',
  ongoingTitle: 'Du har et uferdig spill',
  ongoingBody: 'Vil du fortsette, eller starte et nytt spill? Det uferdige spillet forkastes da.',
  newGame: 'Nytt spill',
  erase: 'Slett',
  hint: 'Tips',
  pause: 'Pause',
  paused: 'Pause',
  pausedBody: 'Klokken står stille.',
  resume: 'Fortsett',
  numbers: 'Tall',
  notes: 'Notater',
  submit: 'Lever brett',
  submitNeedsFull: 'Fyll alle ruter for å levere',
  wonTitle: 'Løst!',
  lostTitle: 'Brettet har feil',
  lostBody: 'Feilene er markert med rødt. Spillet er over.',
  totalTime: 'Tid',
  playTime: 'Spilletid',
  penalty: 'Straff',
  errors: 'Feil',
  hints: 'Tips',
  newRecord: 'Ny rekord!',
  withAutoCheck: 'Med auto-sjekk',
  withoutAutoCheck: 'Uten auto-sjekk',
  solved: 'Løst',
  lost: 'Ikke løst',
  best: 'Beste tid',
  average: 'Snittid',
  noGamesYet: 'Ingen spill ennå',
  language: 'Språk',
  languageAuto: 'Som telefonen',
  ok: 'OK',
  confirmLeaveTitle: 'Gå til hjem?',
} as const;

export type TextKey = keyof typeof nb;

const en: Record<TextKey, string> = {
  dailyPuzzle: 'Daily puzzle',
  dailyDone: 'Solved in {time}',
  dailyPlay: "Play today's puzzle",
  levels: 'Levels',
  continue: 'Continue',
  stats: 'Statistics',
  settings: 'Settings',
  back: 'Back',
  home: 'Home',
  autoCheck: 'Auto-check',
  autoCheckOn: 'Wrong numbers turn red right away and add a {penalty} s penalty.',
  autoCheckOff: 'No checking while you play. You submit the board when it is full, and the submission is final.',
  autoCheckLocked: 'This choice cannot be changed once the game has started.',
  start: 'Start',
  cancel: 'Cancel',
  ongoingTitle: 'You have an unfinished game',
  ongoingBody: 'Continue it, or start a new game? The unfinished game will be discarded.',
  newGame: 'New game',
  erase: 'Erase',
  hint: 'Hint',
  pause: 'Pause',
  paused: 'Paused',
  pausedBody: 'The clock is stopped.',
  resume: 'Resume',
  numbers: 'Numbers',
  notes: 'Notes',
  submit: 'Submit board',
  submitNeedsFull: 'Fill every cell to submit',
  wonTitle: 'Solved!',
  lostTitle: 'The board has mistakes',
  lostBody: 'Mistakes are marked in red. The game is over.',
  totalTime: 'Time',
  playTime: 'Playing time',
  penalty: 'Penalty',
  errors: 'Mistakes',
  hints: 'Hints',
  newRecord: 'New record!',
  withAutoCheck: 'With auto-check',
  withoutAutoCheck: 'Without auto-check',
  solved: 'Solved',
  lost: 'Not solved',
  best: 'Best time',
  average: 'Average',
  noGamesYet: 'No games yet',
  language: 'Language',
  languageAuto: 'Same as phone',
  ok: 'OK',
  confirmLeaveTitle: 'Go home?',
};

const TEXTS: Record<Lang, Record<TextKey, string>> = { nb, en };

export type Translate = (key: TextKey, params?: Record<string, string | number>) => string;

export function makeTranslate(lang: Lang): Translate {
  return (key, params) => {
    let text = TEXTS[lang][key];
    if (params) for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, String(v));
    return text;
  };
}

/** Ukedag for dagens brett. */
export function weekdayName(dateKey: string, lang: Lang): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const name = new Date(y, m - 1, d).toLocaleDateString(lang === 'nb' ? 'nb-NO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
