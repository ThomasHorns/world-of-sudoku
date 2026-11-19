/**
 * Felles grensesnitt for annonser. Selve annonsene ligger i `provider.native.tsx`
 * (Google AdMob). `provider.tsx` brukes på web og viser bare en plassholder i utviklingsmodus.
 *
 * Regler (PLAN.md, fase 2b):
 * - Ingen annonser for Pro.
 * - Banner nederst på hjem, statistikk og innstillinger – ikke under spill.
 * - Fullskjermsannonse etter hvert 2. fullførte spill, når spilleren forlater resultatet.
 * - Samtykke (GDPR) og Apples sporingsspørsmål før annonser lastes.
 */
import { createContext, useContext } from 'react';

/** Mellomannonse etter hvert N. fullførte spill. */
export const INTERSTITIAL_EVERY = 2;

/** Annonse-ID-er fra AdMob. Under utvikling brukes Googles test-ID-er. */
export const AD_UNIT_IDS = {
  bannerIos: 'ca-app-pub-3041624447235807/6362666624',
  interstitialIos: 'ca-app-pub-3041624447235807/1510182232',
};

export interface AdsContextValue {
  /** Annonser kan vises (samtykke innhentet, SDK startet, ikke Pro). */
  ready: boolean;
  /** Brukeren kan/skal kunne endre samtykket sitt (EØS m.fl.). */
  privacyOptionsRequired: boolean;
  openPrivacyOptions: () => void;
  /** Kalles når et spill er ferdig (vunnet eller tapt). */
  noteGameFinished: () => void;
  /** Viser mellomannonsen hvis det er dens tur. Kalles når spilleren forlater resultatet. */
  showInterstitialIfDue: () => void;
  /** Bare i utviklerversjonen: skjuler alle annonser, så det kan tas rene skjermbilder til App Store. */
  screenshotMode: boolean;
  setScreenshotMode: (on: boolean) => void;
}

export const AdsContext = createContext<AdsContextValue | null>(null);

export function useAds(): AdsContextValue {
  const v = useContext(AdsContext);
  if (!v) throw new Error('useAds må brukes inne i AdsProvider');
  return v;
}

/** Teller fullførte spill og sier om det er tid for mellomannonse. Ren funksjon, testbar. */
export function nextAdCount(count: number): { count: number; due: boolean } {
  const next = count + 1;
  return { count: next, due: next % INTERSTITIAL_EVERY === 0 };
}
