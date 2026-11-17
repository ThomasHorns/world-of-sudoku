/**
 * Små felles byggeklosser: knapper, kort og overskrift med tilbakeknapp.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  colors: Colors;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, colors, variant = 'secondary', disabled, style }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.accent : colors.bg,
          borderColor: primary ? colors.accent : colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: primary ? colors.onAccent : colors.text, fontSize: 16, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, colors, style }: { children: React.ReactNode; colors: Colors; style?: ViewStyle }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>{children}</View>
  );
}

export function Header({
  title,
  onBack,
  backLabel,
  colors,
  right,
}: {
  title: string;
  onBack?: () => void;
  backLabel: string;
  colors: Colors;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack && (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={12}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>‹ {backLabel}</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: '500' }}>{title}</Text>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  headerSide: { flex: 1 },
});
