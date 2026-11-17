/**
 * Felles tilstand for appen, lagret lokalt på telefonen (AsyncStorage).
 * Ingen konto i fase 1. Datamodellen har versjonsnummer, så den kan flyttes
 * til en konto senere (fase 3) uten at historikken går tapt.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, Level } from '../../packages/engine/src';
import {
  createGame,
  dailyIndex,
  dailyLevel,
  dateKey,
  emptyStats,
  GameState,
  pickPuzzle,
  recordGame,
  RecordResult,
  Slot,
  slotForLevel,
  Stats,
} from '../../packages/game/src';
import { PUZZLE_BANK } from '../../packages/puzzle-bank';
import { LanguageSetting, makeTranslate, resolveLanguage, Translate } from './i18n';

const STORAGE_KEY = 'wos:data:v1';

export interface AppData {
  version: 1;
  games: Partial<Record<Slot, GameState>>;
  stats: Stats;
  /** Spilte brett per nivå, så samme brett ikke kommer igjen før alle er spilt. */
  played: Record<string, string[]>;
  /** Ferdige dagens brett: dato -> tid og om det ble løst. */
  dailyDone: Record<string, { ms: number; won?: boolean }>;
  settings: { language: LanguageSetting; lastAutoCheck: boolean };
}

function defaultData(): AppData {
  return {
    version: 1,
    games: {},
    stats: emptyStats(),
    played: {},
    dailyDone: {},
    settings: { language: 'auto', lastAutoCheck: true },
  };
}

/** Rydder lagrede data ved oppstart: klokker stoppes, og gamle dagens brett fjernes. */
function normalize(raw: Partial<AppData> | null, today: string): AppData {
  const base = defaultData();
  const d: AppData = {
    ...base,
    ...raw,
    stats: { ...base.stats, ...raw?.stats },
    settings: { ...base.settings, ...raw?.settings },
    games: { ...raw?.games },
  };
  for (const [slot, game] of Object.entries(d.games) as [Slot, GameState][]) {
    if (!game || game.status !== 'playing' || (game.slot === 'daily' && game.dailyDate !== today)) {
      delete d.games[slot];
    } else {
      // Klokken står stille mens appen er lukket.
      d.games[slot] = { ...game, runningSince: null };
    }
  }
  return d;
}

export interface StartOptions {
  slot: Slot;
  autoCheck: boolean;
}

interface AppContextValue {
  data: AppData;
  lang: Lang;
  t: Translate;
  today: string;
  todayLevel: Level;
  saveGame: (game: GameState) => void;
  discardGame: (slot: Slot) => void;
  startGame: (opts: StartOptions) => GameState;
  completeGame: (game: GameState) => RecordResult;
  setLanguage: (language: LanguageSetting) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const dataRef = useRef<AppData | null>(null);
  const today = dateKey(new Date());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        let parsed: Partial<AppData> | null = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          parsed = null;
        }
        return normalize(parsed, today);
      })
      .catch(() => defaultData())
      .then((d) => {
        dataRef.current = d;
        setData(d);
      });
  }, [today]);

  /** Oppdaterer og lagrer med en gang (så ingenting går tapt hvis appen lukkes). */
  const update = useCallback((fn: (d: AppData) => AppData) => {
    const prev = dataRef.current;
    if (!prev) return;
    const next = fn(prev);
    dataRef.current = next;
    setData(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const saveGame = useCallback(
    (game: GameState) => update((d) => ({ ...d, games: { ...d.games, [game.slot]: game } })),
    [update],
  );

  const discardGame = useCallback(
    (slot: Slot) =>
      update((d) => {
        const games = { ...d.games };
        delete games[slot];
        return { ...d, games };
      }),
    [update],
  );

  const startGame = useCallback(
    ({ slot, autoCheck }: StartOptions): GameState => {
      const d = dataRef.current!;
      const isDaily = slot === 'daily';
      const level = isDaily ? dailyLevel(today) : (Number(slot.split('-')[1]) as Level);
      const bank = PUZZLE_BANK[level];
      const puzzle = isDaily
        ? bank[dailyIndex(today, bank.length)]
        : pickPuzzle(bank, d.played[level] ?? []);
      const game = createGame({
        puzzleId: puzzle.id,
        puzzle: puzzle.puzzle,
        solution: puzzle.solution,
        level,
        slot,
        dailyDate: isDaily ? today : null,
        autoCheck,
        now: Date.now(),
      });
      update((prev) => {
        const playedBefore = prev.played[level] ?? [];
        const played =
          playedBefore.length >= bank.length - 1 ? [puzzle.id] : [...playedBefore, puzzle.id];
        return {
          ...prev,
          games: { ...prev.games, [slot]: game },
          played: { ...prev.played, [level]: played },
          settings: { ...prev.settings, lastAutoCheck: autoCheck },
        };
      });
      return game;
    },
    [today, update],
  );

  const completeGame = useCallback(
    (game: GameState): RecordResult => {
      const result = recordGame(dataRef.current!.stats, game);
      update((d) => {
        const games = { ...d.games };
        delete games[game.slot];
        // Dagens brett kan bare spilles én gang, også hvis det ikke ble løst.
        const dailyDone = game.dailyDate
          ? { ...d.dailyDone, [game.dailyDate]: { ms: result.timeMs, won: game.status === 'won' } }
          : d.dailyDone;
        return { ...d, games, stats: result.stats, dailyDone };
      });
      return result;
    },
    [update],
  );

  const setLanguage = useCallback(
    (language: LanguageSetting) =>
      update((d) => ({ ...d, settings: { ...d.settings, language } })),
    [update],
  );

  const value = useMemo<AppContextValue | null>(() => {
    if (!data) return null;
    const lang = resolveLanguage(data.settings.language);
    return {
      data,
      lang,
      t: makeTranslate(lang),
      today,
      todayLevel: dailyLevel(today),
      saveGame,
      discardGame,
      startGame,
      completeGame,
      setLanguage,
    };
  }, [data, today, saveGame, discardGame, startGame, completeGame, setLanguage]);

  // Vent til lagrede data er lest før noe vises.
  if (!value) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(AppContext);
  if (!v) throw new Error('useApp må brukes inne i AppProvider');
  return v;
}

export { slotForLevel };
