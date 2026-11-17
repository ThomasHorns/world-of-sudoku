/**
 * Logo, retning A: 3×3-rutenett i avrundet blå firkant med 9 i midten.
 * Midlertidig utgave – endelig logo tegnes i fase 2.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../theme';

export function Logo({ size, colors }: { size: number; colors: Colors }) {
  const inner = size * 0.68;
  const cell = inner / 3;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel="World of Sudoku"
    >
      <View style={{ width: inner, height: inner, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <View
            key={i}
            style={{
              width: cell,
              height: cell,
              borderRightWidth: i % 3 < 2 ? 1.5 : 0,
              borderBottomWidth: i < 6 ? 1.5 : 0,
              borderColor: colors.onAccent,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: i === 4 ? colors.onAccent : 'transparent',
            }}
          >
            {i === 4 && (
              <Text style={{ color: colors.accent, fontSize: cell * 0.7, fontWeight: '500', lineHeight: cell }}>9</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
