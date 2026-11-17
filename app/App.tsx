/**
 * Midlertidig startskjerm (fase 0).
 * Viser at appen får tak i sudoku-motoren og brettbanken.
 * Selve spillskjermen bygges i fase 1.
 */
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { LEVEL_NAMES, Level, parseGrid, solveLogically } from '../packages/engine/src';
import { PUZZLE_BANK } from '../packages/puzzle-bank';

const LEVELS: Level[] = [1, 2, 3, 4, 5];

export default function App() {
  const dark = useColorScheme() === 'dark';
  const colors = dark
    ? { bg: '#2C2C2A', text: '#F1EFE8', muted: '#B4B2A9', accent: '#85B7EB' }
    : { bg: '#FFFFFF', text: '#2C2C2A', muted: '#5F5E5A', accent: '#185FA5' };

  // Enkel selvtest: løs første brett på hvert nivå med motoren.
  const rows = LEVELS.map((level) => {
    const first = PUZZLE_BANK[level][0];
    const ok = first
      ? solveLogically(parseGrid(first.puzzle)).values.join('') === first.solution
      : false;
    return { level, count: PUZZLE_BANK[level].length, ok };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.accent }]}>World of Sudoku</Text>
      {rows.map((r) => (
        <Text key={r.level} style={[styles.row, { color: colors.text }]}>
          {LEVEL_NAMES.nb[r.level]}: {r.count} brett {r.ok ? '✓' : '✗'}
        </Text>
      ))}
      <Text style={[styles.note, { color: colors.muted }]}>Fase 0 – spillskjermen kommer i fase 1</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '500', marginBottom: 16 },
  row: { fontSize: 16 },
  note: { fontSize: 13, marginTop: 24 },
});
