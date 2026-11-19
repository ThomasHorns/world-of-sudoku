/**
 * World of Sudoku – rotkomponent med enkel skjermnavigasjon.
 */
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Slot } from '../packages/game/src';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import * as GameCenter from './modules/game-center';
import { usePro } from './src/pro/context';
import { ProProvider } from './src/pro/provider';
import { AdBanner, AdsProvider } from './src/ads/provider';
import { AppProvider, useApp } from './src/store';
import { useColors } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'game'; slot: Slot; key: number }
  | { name: 'stats' }
  | { name: 'settings' };

/**
 * Game Center i bakgrunnen: logger inn Pro-brukere og sender resultater som venter.
 * Gratisbrukere blir aldri spurt om Game Center.
 */
function GameCenterSync() {
  const { isPro } = usePro();
  const { data, flushLeaderboard } = useApp();
  const pending = data.leaderboard?.pending.length ?? 0;
  const [authed, setAuthed] = useState(GameCenter.isAuthenticated());

  useEffect(() => {
    if (isPro && GameCenter.gameCenterAvailable && !authed) {
      GameCenter.authenticate().then((ok) => {
        if (__DEV__) console.log(`[toppliste] Game Center-innlogging: ${ok}`);
        setAuthed(ok);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  useEffect(() => {
    if (pending > 0) void flushLeaderboard();
  }, [authed, pending, flushLeaderboard]);

  return null;
}

function Screens() {
  const colors = useColors();
  const { startGame } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  // Innholdet starter under statuslinjen/kameraøya på iPhone, med litt ekstra luft.
  const insets = useSafeAreaInsets();
  const home = () => setRoute({ name: 'home' });

  // Android tilbake-knapp går til hjem.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'home') return false;
      home();
      return true;
    });
    return () => sub.remove();
  }, [route.name]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {route.name === 'home' && (
        <HomeScreen
          onOpenGame={(slot) => setRoute({ name: 'game', slot, key: Date.now() })}
          onStats={() => setRoute({ name: 'stats' })}
          onSettings={() => setRoute({ name: 'settings' })}
        />
      )}
      {route.name === 'game' && (
        <GameScreen
          key={route.key}
          slot={route.slot}
          onHome={home}
          onPlayAgain={(slot, autoCheck, noAids) => {
            startGame({ slot, autoCheck, noAids });
            setRoute({ name: 'game', slot, key: Date.now() });
          }}
        />
      )}
      {route.name === 'stats' && <StatsScreen onBack={home} />}
      {route.name === 'settings' && <SettingsScreen onBack={home} />}
      {/* Banner nederst på alle skjermer unntatt under spill (ikke for Pro). */}
      {route.name !== 'game' && <AdBanner />}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ProProvider>
          <AdsProvider>
            <GameCenterSync />
            <Screens />
          </AdsProvider>
        </ProProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
