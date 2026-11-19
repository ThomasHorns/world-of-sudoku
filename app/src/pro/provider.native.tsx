/**
 * Pro-kjøp på iPhone/iPad (og senere Android) via expo-iap, direkte mot App Store.
 *
 * - Pro er et engangskjøp (ikke-forbrukbart produkt).
 * - Ved oppstart sjekkes tidligere kjøp, så Pro følger Apple-ID-en.
 * - «Gjenopprett kjøp» er påkrevd av Apple og ligger i innstillinger.
 * - Kjøpet avsluttes (finishTransaction) først når Pro er lagret.
 */
import { isUserCancelledError, Purchase, useIAP } from 'expo-iap';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { PRO_PRODUCT_ID, ProContext, ProContextValue } from './context';

export function ProProvider({ children }: { children: React.ReactNode }) {
  const { data, setPro } = useApp();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<ProContextValue['message']>(null);
  const finishRef = useRef<((args: { purchase: Purchase; isConsumable?: boolean }) => Promise<void>) | null>(
    null,
  );

  const onPurchase = useCallback(
    async (purchase: Purchase) => {
      if (purchase.productId !== PRO_PRODUCT_ID) return;
      setPro(true);
      setBusy(false);
      try {
        await finishRef.current?.({ purchase, isConsumable: false });
      } catch {
        // Kjøpet er registrert; App Store leverer det på nytt ved neste oppstart om nødvendig.
      }
    },
    [setPro],
  );

  const iap = useIAP({
    onPurchaseSuccess: (purchase) => void onPurchase(purchase),
    onPurchaseError: (error) => {
      setBusy(false);
      if (!isUserCancelledError(error)) setMessage('purchaseFailed');
    },
    onError: () => setBusy(false),
  });
  finishRef.current = iap.finishTransaction;

  // Hent pris og tidligere kjøp når butikken er tilkoblet.
  useEffect(() => {
    if (!iap.connected) return;
    iap.fetchProducts({ skus: [PRO_PRODUCT_ID], type: 'in-app' }).catch(() => {});
    iap.getAvailablePurchases().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iap.connected]);

  // Tidligere kjøp (også etter «Gjenopprett kjøp») gir Pro.
  useEffect(() => {
    if (iap.availablePurchases.some((p) => p.productId === PRO_PRODUCT_ID)) setPro(true);
  }, [iap.availablePurchases, setPro]);

  const buy = useCallback(() => {
    if (!iap.connected) {
      setMessage('storeUnavailable');
      return;
    }
    setBusy(true);
    iap
      .requestPurchase({
        request: { apple: { sku: PRO_PRODUCT_ID }, google: { skus: [PRO_PRODUCT_ID] } },
        type: 'in-app',
      })
      .catch((error: unknown) => {
        setBusy(false);
        if (!isUserCancelledError(error)) setMessage('purchaseFailed');
      });
  }, [iap]);

  const restore = useCallback(() => {
    if (!iap.connected) {
      setMessage('storeUnavailable');
      return;
    }
    setBusy(true);
    iap
      .restorePurchases()
      .then(() => iap.getAvailablePurchases())
      .then(() => setMessage('restoreDone'))
      .catch(() => setMessage('purchaseFailed'))
      .finally(() => setBusy(false));
  }, [iap]);

  const product = iap.products.find((p) => p.id === PRO_PRODUCT_ID);
  const isPro = !!data.settings.isPro;

  const value = useMemo<ProContextValue>(
    () => ({
      isPro,
      storeAvailable: iap.connected,
      price: product?.displayPrice ?? null,
      busy,
      message,
      clearMessage: () => setMessage(null),
      buy,
      restore,
    }),
    [isPro, iap.connected, product?.displayPrice, busy, message, buy, restore],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}
