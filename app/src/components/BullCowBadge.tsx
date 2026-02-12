import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface BullCowBadgeProps {
  bulls: number;
  cows: number;
}

export function BullCowBadge({ bulls, cows }: BullCowBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.icon}>B</Text>
        <Text style={[styles.count, styles.bullCount]}>{bulls}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.icon}>C</Text>
        <Text style={[styles.count, styles.cowCount]}>{cows}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  icon: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  count: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  bullCount: {
    color: Colors.bull,
  },
  cowCount: {
    color: Colors.cow,
  },
});
