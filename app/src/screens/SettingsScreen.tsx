/**
 * Innstillinger: språk (som telefonen, norsk eller engelsk).
 * Lys/mørk modus følger telefonen.
 */
import React, { useState } from 'react';
import * as GameCenter from '../../modules/game-center';
import { Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { Button, Card, Header } from '../components/ui';
import { LanguageSetting } from '../i18n';
import { useAds } from '../ads/context';
import { usePro } from '../pro/context';
import { useApp } from '../store';
import { leaderboardIds } from '../../../packages/game/src';
import { useColors } from '../theme';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { data, t, setLanguage, flushLeaderboard } = useApp();
  const pro = usePro();
  const ads = useAds();
  const colors = useColors();
  const [gcName, setGcName] = useState<string | null>(GameCenter.displayName());
  const [sending, setSending] = useState(false);
  const [taps, setTaps] = useState(0);
  const log = data.gameCenterLog;
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 460);

  const options: [LanguageSetting, string][] = [
    ['auto', t('languageAuto')],
    ['nb', 'Norsk'],
    ['en', 'English'],
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { width: contentWidth }]}>
      <Header title={t('settings')} onBack={onBack} backLabel={t('home')} colors={colors} />
      <Card colors={colors}>
        {/* 5 trykk på overskriften viser status for topplister (skjult feilsøking). */}
        <Text
          style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}
          onPress={() => setTaps((n) => n + 1)}
          suppressHighlighting
        >
          {t('proTitle')}
        </Text>
        {pro.isPro ? (
          <>
            <Text style={{ color: colors.success }}>{t('proOwned')}</Text>
            {GameCenter.gameCenterAvailable &&
              (gcName ? (
                <Text style={{ color: colors.muted }}>
                  {t('gameCenter')}: {t('gameCenterSignedIn', { name: gcName })}
                </Text>
              ) : (
                <Button
                  label={t('gameCenterSignIn')}
                  colors={colors}
                  onPress={() => GameCenter.authenticate().then(() => setGcName(GameCenter.displayName()))}
                />
              ))}
          </>
        ) : (
          <>
            <Text style={{ color: colors.text, lineHeight: 21 }}>{t('proBody')}</Text>
            <Button
              label={pro.price ? t('proBuy', { price: pro.price }) : t('proBuyNoPrice')}
              variant="primary"
              colors={colors}
              disabled={pro.busy}
              onPress={() => {
                pro.clearMessage();
                pro.buy();
              }}
            />
          </>
        )}
        <Button
          label={t('proRestore')}
          colors={colors}
          disabled={pro.busy}
          onPress={() => {
            pro.clearMessage();
            pro.restore();
          }}
        />
        {pro.message && <Text style={{ color: colors.muted, fontSize: 13 }}>{t(pro.message)}</Text>}
      </Card>
      {pro.isPro && GameCenter.gameCenterAvailable && taps >= 5 && (
        <Card colors={colors}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}>{t('gcStatusTitle')}</Text>
          <Text style={styles.small(colors.muted)}>
            {t('gcQueue', { count: data.leaderboard?.pending.length ?? 0 })}
          </Text>
          {log?.lastSent ? (
            <Text style={styles.small(colors.muted)}>
              {t('gcLastSent', { time: stamp(log.lastSent.at), id: log.lastSent.leaderboardId ?? '' })}
            </Text>
          ) : (
            <Text style={styles.small(colors.muted)}>{t('gcNothingYet')}</Text>
          )}
          {log?.lastError && (
            <Text style={styles.small(colors.error)} selectable>
              {t('gcLastError', {
                time: stamp(log.lastError.at),
                id: log.lastError.leaderboardId ?? '',
                message: log.lastError.message ?? '',
              })}
            </Text>
          )}
          <Button
            label={t('gcSendNow')}
            colors={colors}
            disabled={sending}
            onPress={async () => {
              setSending(true);
              try {
                if (!GameCenter.isAuthenticated()) await GameCenter.authenticate();
                setGcName(GameCenter.displayName());
                await flushLeaderboard();
              } finally {
                setSending(false);
              }
            }}
          />
          <Button
            label={t('gcOpenEasyFastest')}
            colors={colors}
            onPress={() => GameCenter.showLeaderboards(leaderboardIds.fastest(1, 'all')).catch(() => {})}
          />
        </Card>
      )}
      {__DEV__ && (
        <Card colors={colors}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Skjermbildemodus (skjul annonser)</Text>
            <Switch
              value={ads.screenshotMode}
              onValueChange={ads.setScreenshotMode}
              trackColor={{ true: colors.accent, false: colors.border }}
            />
          </View>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Finnes bare i utviklerversjonen.</Text>
        </Card>
      )}
      {ads.privacyOptionsRequired && (
        <Card colors={colors}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}>{t('adPrivacy')}</Text>
          <Text style={{ color: colors.text }}>{t('adPrivacyBody')}</Text>
          <Button label={t('adPrivacy')} colors={colors} onPress={ads.openPrivacyOptions} />
        </Card>
      )}
      <Card colors={colors}>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}>{t('language')}</Text>
        <View style={{ gap: 8 }}>
          {options.map(([value, label]) => {
            const active = data.settings.language === value;
            return (
              <Pressable
                key={value}
                onPress={() => setLanguage(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.option,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active ? colors.accentBg : colors.bg,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.accent : colors.text, fontSize: 16 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

/** Dato og klokkeslett, f.eks. «21.11 15:42:07». */
function stamp(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const styles = {
  ...StyleSheet.create({
    container: { alignSelf: 'center', gap: 12, paddingBottom: 24 },
    option: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center' },
  }),
  small: (color: string) => ({ color, fontSize: 13, lineHeight: 18 }),
};
