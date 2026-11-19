/**
 * Hjem: dagens brett, de fem nivåene, statistikk og innstillinger.
 * Før et spill starter velges auto-sjekk (kan ikke endres underveis).
 */
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { Level, LEVEL_NAMES } from '../../../packages/engine/src';
import { DEFAULT_PENALTIES, Slot, slotForLevel } from '../../../packages/game/src';
import { Logo } from '../components/Logo';
import { Button, Card } from '../components/ui';
import { formatTime } from '../format';
import { weekdayName } from '../i18n';
import { usePro } from '../pro/context';
import { useApp } from '../store';
import { Colors, useColors } from '../theme';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

type Dialog = { kind: 'ongoing'; slot: Slot } | { kind: 'start'; slot: Slot } | null;

interface Props {
  onOpenGame: (slot: Slot) => void;
  onStats: () => void;
  onSettings: () => void;
}

export function HomeScreen({ onOpenGame, onStats, onSettings }: Props) {
  const { data, t, lang, today, todayLevel, startGame, discardGame } = useApp();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 460);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [autoCheck, setAutoCheck] = useState(data.settings.lastAutoCheck);
  const { isPro } = usePro();
  const [noAids, setNoAids] = useState(!!data.settings.lastNoAids);

  const openStart = (slot: Slot) => {
    setAutoCheck(data.settings.lastAutoCheck);
    setNoAids(!!data.settings.lastNoAids);
    setDialog({ kind: 'start', slot });
  };

  const choose = (slot: Slot) => {
    if (data.games[slot]) setDialog({ kind: 'ongoing', slot });
    else openStart(slot);
  };

  const start = (slot: Slot) => {
    startGame({ slot, autoCheck, noAids: isPro && noAids });
    setDialog(null);
    onOpenGame(slot);
  };

  const dailyDone = data.dailyDone[today];
  const dailyOngoing = !!data.games.daily;
  const slotTitle = (slot: Slot) =>
    slot === 'daily'
      ? `${t('dailyPuzzle')} · ${LEVEL_NAMES[lang][todayLevel]}`
      : LEVEL_NAMES[lang][Number(slot.split('-')[1]) as Level];

  return (
    <ScrollView contentContainerStyle={[styles.container, { width: contentWidth }]}>
      <View style={styles.titleRow}>
        <Logo size={44} colors={colors} />
        <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '500' }}>World of Sudoku</Text>
      </View>

      <Card colors={colors}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{weekdayName(today, lang)}</Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '500' }}>
          {t('dailyPuzzle')} · {LEVEL_NAMES[lang][todayLevel]}
        </Text>
        {dailyDone ? (
          dailyDone.won === false ? (
            <Text style={{ color: colors.error }}>{t('lost')}</Text>
          ) : (
            <Text style={{ color: colors.success }}>{t('dailyDone', { time: formatTime(dailyDone.ms) })}</Text>
          )
        ) : (
          <Button
            label={dailyOngoing ? t('continue') : t('dailyPlay')}
            variant="primary"
            colors={colors}
            onPress={() => choose('daily')}
          />
        )}
      </Card>

      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{t('levels')}</Text>
      <View style={{ gap: 8 }}>
        {LEVELS.map((level) => {
          const slot = slotForLevel(level);
          const ongoing = !!data.games[slot];
          const s = data.stats[level];
          const bests = [s.autoCheck.bestMs, s.noAutoCheck.bestMs].filter((x): x is number => x !== null);
          return (
            <Pressable
              key={level}
              onPress={() => choose(slot)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.levelRow,
                { borderColor: colors.border, backgroundColor: colors.bg, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 17 }}>{LEVEL_NAMES[lang][level]}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {bests.length > 0 && (
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{formatTime(Math.min(...bests))}</Text>
                )}
                {ongoing && <Pill label={t('continue')} colors={colors} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Button label={t('stats')} colors={colors} onPress={onStats} style={{ flex: 1 }} />
        <Button label={t('settings')} colors={colors} onPress={onSettings} style={{ flex: 1 }} />
      </View>

      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={styles.backdrop}>
          {dialog?.kind === 'ongoing' && (
            <Card colors={colors} style={{ width: contentWidth }}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>{t('ongoingTitle')}</Text>
              <Text style={{ color: colors.muted }}>{slotTitle(dialog.slot)}</Text>
              <Text style={{ color: colors.text }}>{t('ongoingBody')}</Text>
              <Button
                label={t('continue')}
                variant="primary"
                colors={colors}
                onPress={() => {
                  setDialog(null);
                  onOpenGame(dialog.slot);
                }}
              />
              {/* Dagens brett kan ikke startes på nytt med et annet brett, så der finnes bare Fortsett. */}
              {dialog.slot !== 'daily' && (
                <Button
                  label={t('newGame')}
                  colors={colors}
                  onPress={() => {
                    discardGame(dialog.slot);
                    openStart(dialog.slot);
                  }}
                />
              )}
              <Button label={t('cancel')} colors={colors} onPress={() => setDialog(null)} />
            </Card>
          )}
          {dialog?.kind === 'start' && (
            <Card colors={colors} style={{ width: contentWidth }}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>{slotTitle(dialog.slot)}</Text>
              {isPro ? (
                <View style={styles.switchRow}>
                  <Text style={{ color: colors.text, fontSize: 17 }}>{t('noAids')}</Text>
                  <Switch
                    value={noAids}
                    onValueChange={setNoAids}
                    trackColor={{ true: colors.accent, false: colors.border }}
                    accessibilityLabel={t('noAids')}
                  />
                </View>
              ) : (
                <Text style={{ color: colors.muted, fontSize: 13 }}>{t('noAidsNeedsPro')}</Text>
              )}
              {isPro && noAids ? (
                <Text style={{ color: colors.text }}>{t('noAidsOn')}</Text>
              ) : (
                <>
                  <View style={styles.switchRow}>
                    <Text style={{ color: colors.text, fontSize: 17 }}>{t('autoCheck')}</Text>
                    <Switch
                      value={autoCheck}
                      onValueChange={setAutoCheck}
                      trackColor={{ true: colors.accent, false: colors.border }}
                      accessibilityLabel={t('autoCheck')}
                    />
                  </View>
                  <Text style={{ color: colors.text }}>
                    {autoCheck
                      ? t('autoCheckOn', { penalty: DEFAULT_PENALTIES.errorMs / 1000 })
                      : t('autoCheckOff')}
                  </Text>
                </>
              )}
              <Text style={{ color: colors.muted, fontSize: 13 }}>{t('autoCheckLocked')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label={t('cancel')} colors={colors} onPress={() => setDialog(null)} style={{ flex: 1 }} />
                <Button
                  label={t('start')}
                  variant="primary"
                  colors={colors}
                  onPress={() => start(dialog.slot)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

function Pill({ label, colors }: { label: string; colors: Colors }) {
  return (
    <View style={{ backgroundColor: colors.accentBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: colors.accent, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', gap: 12, paddingVertical: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: { fontSize: 20, fontWeight: '500' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
