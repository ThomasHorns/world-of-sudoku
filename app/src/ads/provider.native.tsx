/**
 * Annonser med Google AdMob (react-native-google-mobile-ads).
 *
 * Ved oppstart (bare for gratisbrukere):
 * 1. Googles samtykkeverktøy (UMP) viser GDPR-meldingen i EØS/UK/Sveits og IDFA-forklaringen,
 *    og deretter Apples sporingsspørsmål. Meldingene er satt opp i AdMob.
 * 2. Når samtykket tillater annonser, startes AdMob og mellomannonsen lastes på forhånd.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import { usePro } from '../pro/context';
import { AD_UNIT_IDS, AdsContext, AdsContextValue, nextAdCount, useAds } from './context';

const BANNER_ID = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.bannerIos;
const INTERSTITIAL_ID = __DEV__ ? TestIds.INTERSTITIAL : AD_UNIT_IDS.interstitialIos;
const COUNT_KEY = 'wos:ads:finishedGames';

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const { isPro } = usePro();
  const [ready, setReady] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const interstitial = useRef<InterstitialAd | null>(null);
  const interstitialLoaded = useRef(false);
  const due = useRef(false);
  const count = useRef(0);

  // Samtykke og oppstart av AdMob.
  useEffect(() => {
    if (isPro) {
      setReady(false);
      return;
    }
    let cancelled = false;
    (async () => {
      let canRequestAds = false;
      try {
        const info = await AdsConsent.gatherConsent();
        canRequestAds = info.canRequestAds;
        if (!cancelled) {
          setPrivacyOptionsRequired(
            info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
          );
        }
      } catch {
        // F.eks. uten nett: bruk samtykket fra forrige gang, hvis det finnes.
        const info = await AdsConsent.getConsentInfo().catch(() => null);
        canRequestAds = !!info?.canRequestAds;
      }
      if (!canRequestAds || cancelled) return;
      await mobileAds().initialize();
      if (!cancelled) setReady(true);
    })();
    AsyncStorage.getItem(COUNT_KEY).then((v) => {
      count.current = Number(v) || 0;
    });
    return () => {
      cancelled = true;
    };
  }, [isPro]);

  // Mellomannonsen lastes på forhånd og lastes på nytt etter at den er vist.
  useEffect(() => {
    if (!ready || isPro) return;
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
    interstitial.current = ad;
    const subs = [
      ad.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoaded.current = true;
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoaded.current = false;
        ad.load();
      }),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        interstitialLoaded.current = false;
      }),
    ];
    ad.load();
    return () => {
      subs.forEach((unsubscribe) => unsubscribe());
      interstitial.current = null;
      interstitialLoaded.current = false;
    };
  }, [ready, isPro]);

  const noteGameFinished = useCallback(() => {
    if (isPro) return;
    const next = nextAdCount(count.current);
    count.current = next.count;
    if (next.due) due.current = true;
    AsyncStorage.setItem(COUNT_KEY, String(next.count)).catch(() => {});
  }, [isPro]);

  const showInterstitialIfDue = useCallback(() => {
    if (isPro || !due.current || !interstitialLoaded.current || !interstitial.current) return;
    due.current = false;
    interstitial.current.show().catch(() => {});
  }, [isPro]);

  const openPrivacyOptions = useCallback(() => {
    AdsConsent.showPrivacyOptionsForm().catch(() => {});
  }, []);

  const value = useMemo<AdsContextValue>(
    () => ({
      ready: ready && !isPro,
      privacyOptionsRequired: privacyOptionsRequired && !isPro,
      openPrivacyOptions,
      noteGameFinished,
      showInterstitialIfDue,
    }),
    [ready, isPro, privacyOptionsRequired, openPrivacyOptions, noteGameFinished, showInterstitialIfDue],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

/** Liten banner nederst på skjermen. Vises ikke for Pro eller før samtykke er avklart. */
export function AdBanner() {
  const { ready } = useAds();
  if (!ready) return null;
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />
    </View>
  );
}
