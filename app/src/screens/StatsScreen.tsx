/**
 * Statistikk per nivå, med egne tall for spill med og uten auto-sjekk.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Level, LEVEL_NAMES } from '../../../packages/engine/src';
import { averageMs, ModeStats } from '../../../packages/game/src';
import { Card, Header } from '../components/ui';
import { formatTime } from '../format';
import { useApp } from '../store';
import { useColors } from '../theme';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const { data, t, lang } = useApp();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 460);

  const mode = (label: string, m: ModeStats) => {
    const avg = averageMs(m);
    const rows: [string, string][] = [
      [t('solved'), String(m.won)],
      [t('lost'), String(m.lost)],
      [t('best'), m.bestMs !== null ? formatTime(m.bestMs) : '–'],
      [t('average'), avg !== null ? formatTime(avg) : '–'],
    ];
    return (
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={{ color: colors.muted }}>{k}</Text>
            <Text style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>{v}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { width: contentWidth }]}>
      <Header title={t('stats')} onBack={onBack} backLabel={t('home')} colors={colors} />
      {LEVELS.map((level) => {
        const s = data.stats[level];
        const any = s.autoCheck.won + s.autoCheck.lost + s.noAutoCheck.won + s.noAutoCheck.lost > 0;
        return (
          <Card key={level} colors={colors}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '500' }}>{LEVEL_NAMES[lang][level]}</Text>
            {any ? (
              <>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {mode(t('withAutoCheck'), s.autoCheck)}
                  {mode(t('withoutAutoCheck'), s.noAutoCheck)}
                </View>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {t('hints')}: {s.hints} · {t('errors')}: {s.errors}
                </Text>
              </>
            ) : (
              <Text style={{ color: colors.muted }}>{t('noGamesYet')}</Text>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
