/**
 * Apple Game Center for World of Sudoku.
 * Finnes bare på iPhone/iPad. På web og Android er `available` false, og alle kall gjør ingenting.
 */
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

interface NativeGameCenter {
  isAuthenticated(): boolean;
  displayName(): string | null;
  authenticate(): Promise<boolean>;
  submitScore(score: number, leaderboardIDs: string[]): Promise<boolean>;
  showLeaderboards(leaderboardID: string | null): Promise<boolean>;
}

const native = Platform.OS === 'ios' ? requireOptionalNativeModule<NativeGameCenter>('GameCenter') : null;

export const gameCenterAvailable = native !== null;

export function isAuthenticated(): boolean {
  return native?.isAuthenticated() ?? false;
}

export function displayName(): string | null {
  return native?.displayName() ?? null;
}

/** Logger inn (viser Apples vindu ved behov). */
export async function authenticate(): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.authenticate();
  } catch {
    return false;
  }
}

/** Sender et resultat. Kaster feil hvis det ikke gikk, så det kan prøves igjen senere. */
export async function submitScore(score: number, leaderboardIDs: string[]): Promise<void> {
  if (!native) throw new Error('Game Center is not available');
  await native.submitScore(Math.round(score), leaderboardIDs);
}

export async function showLeaderboards(leaderboardID?: string): Promise<void> {
  if (!native) return;
  await native.showLeaderboards(leaderboardID ?? null);
}
