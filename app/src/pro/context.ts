/**
 * Felles grensesnitt for Pro-kjøpet. Selve kjøpet ligger i `provider.native.tsx`
 * (iPhone/Android, via expo-iap). `provider.tsx` brukes på web, der App Store ikke finnes.
 */
import { createContext, useContext } from 'react';
import type { TextKey } from '../i18n';

/** Produkt-ID-en for Pro i App Store Connect. Kan ikke endres etter at produktet er opprettet. */
export const PRO_PRODUCT_ID = 'worldofsudoku_pro';

export interface ProContextValue {
  isPro: boolean;
  /** Butikken er tilkoblet, så kjøp og gjenoppretting kan gjøres. */
  storeAvailable: boolean;
  /** Pris fra App Store, f.eks. «49,00 kr». Null til produktet er hentet. */
  price: string | null;
  busy: boolean;
  /** Melding til brukeren etter kjøp/gjenoppretting (tekstnøkkel). */
  message: TextKey | null;
  clearMessage: () => void;
  buy: () => void;
  restore: () => void;
}

export const ProContext = createContext<ProContextValue | null>(null);

export function usePro(): ProContextValue {
  const v = useContext(ProContext);
  if (!v) throw new Error('usePro må brukes inne i ProProvider');
  return v;
}
