/**
 * Annonser på web: AdMob finnes ikke. I utviklingsmodus vises en grå plassholder der
 * banneret skal stå, og «mellomannonsen» logges i konsollen, så oppsettet kan prøves i nettleseren.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { usePro } from '../pro/context';
import { AdsContext, AdsContextValue, nextAdCount, useAds } from './context';

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const { isPro } = usePro();
  const count = useRef(0);
  const due = useRef(false);

  const noteGameFinished = useCallback(() => {
    if (isPro) return;
    const next = nextAdCount(count.current);
    count.current = next.count;
    if (next.due) due.current = true;
  }, [isPro]);

  const showInterstitialIfDue = useCallback(() => {
    if (isPro || !due.current) return;
    due.current = false;
    if (__DEV__) console.log('[annonser] Mellomannonse ville blitt vist her');
  }, [isPro]);

  const [screenshotMode, setScreenshotMode] = useState(false);

  const value = useMemo<AdsContextValue>(
    () => ({
      ready: __DEV__ && !isPro && !screenshotMode,
      privacyOptionsRequired: false,
      openPrivacyOptions: () => {},
      noteGameFinished,
      showInterstitialIfDue,
      screenshotMode,
      setScreenshotMode,
    }),
    [isPro, noteGameFinished, showInterstitialIfDue, screenshotMode],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function AdBanner() {
  const { ready } = useAds();
  if (!ready) return null;
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 320,
        height: 50,
        backgroundColor: '#D3D1C7',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#5F5E5A', fontSize: 12 }}>Annonse (plassholder, bare på web)</Text>
    </View>
  );
}
