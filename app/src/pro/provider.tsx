/**
 * Pro på web: App Store finnes ikke. I utviklingsmodus kan Pro slås av og på
 * med et «testkjøp», så skjermene kan prøves i nettleseren.
 */
import React, { useMemo, useState } from 'react';
import { useApp } from '../store';
import { ProContext, ProContextValue } from './context';

export function ProProvider({ children }: { children: React.ReactNode }) {
  const { data, setPro } = useApp();
  const [message, setMessage] = useState<ProContextValue['message']>(null);
  const isPro = !!data.settings.isPro;

  const value = useMemo<ProContextValue>(
    () => ({
      isPro,
      storeAvailable: __DEV__,
      price: __DEV__ ? '49,00 kr (test)' : null,
      busy: false,
      message,
      clearMessage: () => setMessage(null),
      buy: () => (__DEV__ ? setPro(true) : setMessage('storeUnavailable')),
      restore: () => (__DEV__ ? setPro(false) : setMessage('storeUnavailable')),
    }),
    [isPro, message, setPro],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}
