/**
 * Tallrad 1–9 (setter inn tall) og notatrad 1–9 (slår notater av/på) under hverandre.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';

interface Props {
  width: number;
  colors: Colors;
  numbersLabel: string;
  notesLabel: string;
  /** Antall av hvert siffer på brettet (indeks 1–9). */
  counts: number[];
  disabled: boolean;
  onDigit: (d: number) => void;
  onNote: (d: number) => void;
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function NumberPad({ width, colors, numbersLabel, notesLabel, counts, disabled, onDigit, onNote }: Props) {
  const gap = 4;
  const key = (width - gap * 8) / 9;
  return (
    <View style={{ width, gap: 6, opacity: disabled ? 0.4 : 1 }}>
      <Text style={[styles.label, { color: colors.muted }]}>{numbersLabel}</Text>
      <View style={[styles.row, { gap }]}>
        {DIGITS.map((d) => {
          const done = counts[d] >= 9;
          return (
            <Pressable
              key={d}
              disabled={disabled}
              onPress={() => onDigit(d)}
              accessibilityLabel={`${numbersLabel} ${d}`}
              style={({ pressed }) => [
                styles.key,
                {
                  width: key,
                  height: Math.min(48, key * 1.25),
                  backgroundColor: colors.padBg,
                  opacity: pressed ? 0.6 : done ? 0.35 : 1,
                },
              ]}
            >
              <Text style={{ color: colors.padText, fontSize: 20 }}>{d}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.label, { color: colors.muted }]}>{notesLabel}</Text>
      <View style={[styles.row, { gap }]}>
        {DIGITS.map((d) => (
          <Pressable
            key={d}
            disabled={disabled}
            onPress={() => onNote(d)}
            accessibilityLabel={`${notesLabel} ${d}`}
            style={({ pressed }) => [
              styles.key,
              {
                width: key,
                height: Math.min(36, key),
                backgroundColor: colors.notePadBg,
                borderWidth: 1,
                borderColor: colors.notePadBorder,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={{ color: colors.notePadText, fontSize: 14 }}>{d}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginLeft: 2, marginBottom: -2 },
  row: { flexDirection: 'row' },
  key: { borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
