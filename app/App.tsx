/**
 * World of Sudoku – rotkomponent med enkel skjermnavigasjon.
 */
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from '../packages/game/src';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { AppProvider, useApp } from './src/store';
import { useColors } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'game'; slot: Slot; key: number }
  | { name: 'stats' }
  | { name: 'settings' };

function Screens() {
  const colors = useColors();
  const { startGame } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });
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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
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
          onPlayAgain={(slot, autoCheck) => {
            startGame({ slot, autoCheck });
            setRoute({ name: 'game', slot, key: Date.now() });
          }}
        />
      )}
      {route.name === 'stats' && <StatsScreen onBack={home} />}
      {route.name === 'settings' && <SettingsScreen onBack={home} />}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Screens />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
