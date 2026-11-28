/**
 * Krasjrapporter med Sentry.
 *
 * Bare krasj og feil sendes: ingen skjermopptak, ingen ytelsesmåling og ingen
 * personopplysninger (IP-adresse o.l.). Det stemmer med App Privacy
 * («Crash Data – ikke knyttet til bruker, ikke sporing») og personvernerklæringen.
 *
 * DSN er ikke hemmelig (den ligger uansett i appen). Er den tom, er Sentry av.
 * I utviklerversjonen sendes ingenting.
 */
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN: string =
  'https://02e05d03d598398e9f454895871cd395@o4512481939357696.ingest.de.sentry.io/4512481948401744';

export const crashReportingEnabled = !__DEV__ && SENTRY_DSN !== '';

export function initCrashReporting(): void {
  if (!crashReportingEnabled) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // Øktstatistikk (andel brukere uten krasj) er av: bare selve krasjene sendes.
    enableAutoSessionTracking: false,
  });
}

/** Pakker inn rotkomponenten så feil i React fanges opp. */
export const wrapRoot = Sentry.wrap;
