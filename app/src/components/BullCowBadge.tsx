import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius } from '../constants/theme';

interface BullCowBadgeProps {
  bulls: number;
  cows: number;
}

export function BullCowBadge({ bulls, cows }: BullCowBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, styles.bullBadge]}>
        <Text style={styles.bullIcon}>B</Text>
        <Text style={styles.bullCount}>{bulls}</Text>
      </View>
      <View style={[styles.badge, styles.cowBadge]}>
        <Text style={styles.cowIcon}>C</Text>
        <Text style={styles.cowCount}>{cows}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    minWidth: 38,
    justifyContent: 'center',
  },
  bullBadge: {
    backgroundColor: Colors.bullBg,
  },
  cowBadge: {
    backgroundColor: Colors.cowBg,
  },
  bullIcon: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.bull,
  },
  cowIcon: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  bullCount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.bull,
  },
  cowCount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
});
