import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius } from '../constants/theme';

const bullIcon = require('../../assets/images/bull_icon.png');
const cowIcon = require('../../assets/images/cow_icon.png');

interface BullCowBadgeProps {
  bulls: number;
  cows: number;
}

export function BullCowBadge({ bulls, cows }: BullCowBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, styles.bullBadge]}>
        <Image source={bullIcon} style={styles.icon} />
        <Text style={styles.bullCount}>{bulls}</Text>
      </View>
      <View style={[styles.badge, styles.cowBadge]}>
        <Image source={cowIcon} style={styles.icon} />
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
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
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
