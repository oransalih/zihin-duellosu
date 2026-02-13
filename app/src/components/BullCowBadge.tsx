import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../constants/theme';

const bullIcon = require('../../assets/images/bull_icon.png');
const cowIcon = require('../../assets/images/cow_icon.png');

interface BullCowBadgeProps {
  bulls: number;
  cows: number;
}

export function BullCowBadge({ bulls, cows }: BullCowBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Image source={bullIcon} style={styles.icon} />
        <Text style={styles.bullCount}>{bulls}</Text>
      </View>
      <View style={styles.badge}>
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
    gap: 4,
    flexShrink: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  icon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  bullCount: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.bull,
  },
  cowCount: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
});
