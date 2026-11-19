/**
 * Innstillinger: språk (som telefonen, norsk eller engelsk).
 * Lys/mørk modus følger telefonen.
 */
import React, { useState } from 'react';
import * as GameCenter from '../../modules/game-center';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button, Card, Header } from '../components/ui';
import { LanguageSetting } from '../i18n';
import { useAds } from '../ads/context';
import { usePro } from '../pro/context';
import { useApp } from '../store';
import { useColors } from '../theme';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { data, t, setLanguage } = useApp();
  const pro = usePro();
  const ads = useAds();
  const colors = useColors();
  const [gcName, setGcName] = useState<string | null>(GameCenter.displayName());
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
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}>{t('proTitle')}</Text>
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

const styles = StyleSheet.create({
  container: { alignSelf: 'center', gap: 12, paddingBottom: 24 },
  option: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center' },
});
