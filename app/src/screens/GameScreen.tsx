/**
 * Spillskjermen: tid og nivå øverst, brettet, verktøyrad (Slett, Tips, Pause),
 * tallrad og notatrad. «Lever brett» vises når auto-sjekk er av.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  colOf,
  describeStep,
  ERROR_HINT_TEXT,
  Hint,
  LEVEL_NAMES,
  rowOf,
  TECHNIQUE_NAMES,
} from '../../../packages/engine/src';
import {
  activeMs,
  canSubmit,
  DEFAULT_PENALTIES,
  digitCounts,
  enterDigit,
  eraseCell,
  GameState,
  isRunning,
  pause,
  RecordResult,
  requestHint,
  resume,
  Slot,
  submit,
  toggleNote,
  totalMs,
} from '../../../packages/game/src';
import { Board } from '../components/Board';
import { NumberPad } from '../components/NumberPad';
import { Button, Card, Header } from '../components/ui';
import { formatTime } from '../format';
import { useApp } from '../store';
import { useColors } from '../theme';

interface Props {
  slot: Slot;
  onHome: () => void;
  onPlayAgain: (slot: Slot, autoCheck: boolean) => void;
}

export function GameScreen({ slot, onHome, onPlayAgain }: Props) {
  const { data, t, lang, saveGame, completeGame } = useApp();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 460);

  const [game, setGame] = useState<GameState>(() => resume(data.games[slot]!, Date.now()));
  const [selected, setSelected] = useState<number | null>(null);
  /**
   * Tallet i fokus. Settes når man velger en rute med et tall eller setter inn et tall,
   * og blir værende når man velger en tom rute (f.eks. for å skrive notater).
   */
  const [focusDigit, setFocusDigit] = useState<number | null>(null);
  const [hint, setHint] = useState<Hint | null>(null);
  const [result, setResult] = useState<RecordResult | null>(null);
  const [now, setNow] = useState(Date.now());
  const [flash, setFlash] = useState<string | null>(null);

  const gameRef = useRef(game);
  gameRef.current = game;

  /** Ny tilstand: lagres mens spillet pågår, registreres i statistikken når det er ferdig. */
  const apply = useCallback(
    (next: GameState) => {
      const prev = gameRef.current;
      if (next === prev) return;
      gameRef.current = next;
      setGame(next);
      setNow(Date.now());
      if (next.penaltyMs > prev.penaltyMs) {
        setFlash(`+${Math.round((next.penaltyMs - prev.penaltyMs) / 1000)} s`);
      }
      if (next.status === 'playing') {
        saveGame(next);
      } else if (prev.status === 'playing') {
        setResult(completeGame(next));
        setSelected(null);
        setHint(null);
      }
    },
    [saveGame, completeGame],
  );

  // Klokke: oppdater visningen, og lagre et øyeblikksbilde av tiden jevnlig.
  useEffect(() => {
    if (!isRunning(game)) return;
    let ticks = 0;
    const id = setInterval(() => {
      const t0 = Date.now();
      setNow(t0);
      if (++ticks % 20 === 0) {
        const g = gameRef.current;
        if (g.status === 'playing' && g.runningSince !== null) {
          saveGame({ ...g, elapsedMs: activeMs(g, t0), runningSince: t0 });
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [game.runningSince, game.status, saveGame]);

  // Straffemarkering ved klokken forsvinner etter litt.
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(id);
  }, [flash]);

  // Pause når appen går i bakgrunnen. Brettet forblir skjult til spilleren trykker Fortsett.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') apply(pause(gameRef.current, Date.now()));
    });
    return () => sub.remove();
  }, [apply]);

  // Stopp klokken og lagre når skjermen forlates.
  useEffect(
    () => () => {
      const g = gameRef.current;
      if (g.status === 'playing') saveGame(pause(g, Date.now()));
    },
    [saveGame],
  );

  const playing = game.status === 'playing';
  const paused = playing && !isRunning(game);

  const onDigit = useCallback(
    (d: number) => {
      if (selected === null || paused) return;
      setHint(null);
      const next = enterDigit(gameRef.current, selected, d, Date.now(), DEFAULT_PENALTIES).state;
      if (next.values[selected] === d) setFocusDigit(d);
      apply(next);
    },
    [selected, paused, apply],
  );

  const onNote = useCallback(
    (d: number) => {
      if (selected === null || paused) return;
      apply(toggleNote(gameRef.current, selected, d));
    },
    [selected, paused, apply],
  );

  /** Velg rute. Har ruten et tall, blir det tallet i fokus; ellers beholdes fokuset. */
  const onSelect = useCallback((cell: number) => {
    setSelected(cell);
    const v = gameRef.current.values[cell];
    if (v) setFocusDigit(v);
  }, []);

  const onErase = useCallback(() => {
    if (selected === null || paused) return;
    apply(eraseCell(gameRef.current, selected));
  }, [selected, paused, apply]);

  const onHint = () => {
    if (paused || !playing) return;
    const r = requestHint(gameRef.current, DEFAULT_PENALTIES);
    apply(r.state);
    setHint(r.hint.kind === 'none' ? null : r.hint);
  };

  const onPauseToggle = () => {
    apply(paused ? resume(game, Date.now()) : pause(game, Date.now()));
    setHint(null);
  };

  // Tastatur i nettleseren: 1–9 setter inn tall, Backspace/Delete sletter, piler flytter.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) onDigit(Number(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete') onErase();
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        setSelected((s) => {
          const cur = s ?? 40;
          const r = rowOf(cur);
          const c = colOf(cur);
          if (e.key === 'ArrowUp') return Math.max(0, r - 1) * 9 + c;
          if (e.key === 'ArrowDown') return Math.min(8, r + 1) * 9 + c;
          if (e.key === 'ArrowLeft') return r * 9 + Math.max(0, c - 1);
          return r * 9 + Math.min(8, c + 1);
        });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDigit, onErase]);

  const hintCells =
    hint?.kind === 'step'
      ? [...hint.step.patternCells, ...hint.step.placements.map((p) => p.cell)]
      : [];

  const levelName = LEVEL_NAMES[lang][game.level];
  const title = game.dailyDate ? `${t('dailyPuzzle')} · ${levelName}` : levelName;

  const timer = (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ color: colors.text, fontSize: 17, fontVariant: ['tabular-nums'] }}>
        {formatTime(totalMs(game, now))}
      </Text>
      {flash && <Text style={{ color: colors.error, fontSize: 12 }}>{flash}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { width: contentWidth }]}>
      <Header title={title} onBack={onHome} backLabel={t('home')} colors={colors} right={timer} />

      {paused ? (
        <View
          style={[
            styles.pausePanel,
            { width: contentWidth, height: contentWidth, backgroundColor: colors.surface },
          ]}
        >
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '500' }}>{t('paused')}</Text>
          <Text style={{ color: colors.muted }}>{t('pausedBody')}</Text>
          <Button label={t('resume')} variant="primary" colors={colors} onPress={onPauseToggle} />
        </View>
      ) : (
        <Board
          game={game}
          selected={selected}
          hintCells={hintCells}
          focusDigit={focusDigit}
          size={contentWidth}
          colors={colors}
          onSelect={onSelect}
        />
      )}

      {hint && (
        <Card colors={colors} style={{ backgroundColor: colors.hintBg, borderColor: colors.hintBg }}>
          {hint.kind === 'error' ? (
            <Text style={{ color: colors.text }}>{ERROR_HINT_TEXT[lang]}</Text>
          ) : hint.kind === 'step' ? (
            <>
              <Text style={{ color: colors.text, fontWeight: '500' }}>
                {TECHNIQUE_NAMES[lang][hint.step.technique]}
              </Text>
              <Text style={{ color: colors.text, lineHeight: 21 }}>{describeStep(hint.step, lang)}</Text>
            </>
          ) : null}
          <Button label={t('ok')} colors={colors} onPress={() => setHint(null)} />
        </Card>
      )}

      {playing ? (
        <>
          <View style={styles.tools}>
            <ToolButton label={t('erase')} onPress={onErase} disabled={paused} colors={colors} />
            <ToolButton
              label={`${t('hint')} (+${DEFAULT_PENALTIES.hintMs / 1000} s)`}
              onPress={onHint}
              disabled={paused}
              colors={colors}
            />
            <ToolButton
              label={paused ? t('resume') : t('pause')}
              onPress={onPauseToggle}
              colors={colors}
            />
          </View>
          <NumberPad
            width={contentWidth}
            colors={colors}
            numbersLabel={t('numbers')}
            notesLabel={t('notes')}
            counts={digitCounts(game)}
            disabled={paused}
            onDigit={onDigit}
            onNote={onNote}
          />
          {!game.autoCheck && (
            <View style={{ gap: 6 }}>
              <Button
                label={t('submit')}
                variant="primary"
                colors={colors}
                disabled={!canSubmit(game) || paused}
                onPress={() => apply(submit(gameRef.current, Date.now()))}
              />
              {!canSubmit(game) && (
                <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 13 }}>
                  {t('submitNeedsFull')}
                </Text>
              )}
            </View>
          )}
        </>
      ) : (
        <ResultCard
          game={game}
          result={result}
          onHome={onHome}
          onPlayAgain={game.dailyDate ? undefined : () => onPlayAgain(slot, game.autoCheck)}
        />
      )}
    </ScrollView>
  );
}

function ToolButton({
  label,
  onPress,
  disabled,
  colors,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Button
      label={label}
      onPress={onPress}
      disabled={disabled}
      colors={colors}
      style={{ flex: 1, minHeight: 44, paddingHorizontal: 8 }}
    />
  );
}

function ResultCard({
  game,
  result,
  onHome,
  onPlayAgain,
}: {
  game: GameState;
  result: RecordResult | null;
  onHome: () => void;
  onPlayAgain?: () => void;
}) {
  const { t } = useApp();
  const colors = useColors();
  const won = game.status === 'won';
  const end = game.finishedAt ?? Date.now();
  const rows: [string, string][] = [
    [t('playTime'), formatTime(activeMs(game, end))],
    [t('penalty'), formatTime(game.penaltyMs)],
    [t('errors'), String(game.errorCount + game.wrongCells.length)],
    [t('hints'), String(game.hintCount)],
  ];
  return (
    <Card colors={colors}>
      <Text style={{ color: won ? colors.success : colors.error, fontSize: 22, fontWeight: '500' }}>
        {won ? t('wonTitle') : t('lostTitle')}
      </Text>
      {won ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Text style={{ color: colors.text, fontSize: 32, fontWeight: '500' }}>
            {formatTime(totalMs(game, end))}
          </Text>
          {result?.newRecord && (
            <Text style={{ color: colors.accent, fontWeight: '500' }}>{t('newRecord')}</Text>
          )}
        </View>
      ) : (
        <Text style={{ color: colors.text }}>{t('lostBody')}</Text>
      )}
      <View style={{ gap: 4 }}>
        {rows.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted }}>{k}</Text>
            <Text style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>{v}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 13 }}>
        {game.autoCheck ? t('withAutoCheck') : t('withoutAutoCheck')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label={t('home')} colors={colors} onPress={onHome} style={{ flex: 1 }} />
        {onPlayAgain && (
          <Button label={t('newGame')} variant="primary" colors={colors} onPress={onPlayAgain} style={{ flex: 1 }} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', gap: 12, paddingBottom: 24 },
  pausePanel: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tools: { flexDirection: 'row', gap: 8 },
});
