import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { BullCowBadge } from './BullCowBadge';

interface GuessRowProps {
  index: number;
  guess?: string;
  bulls: number;
  cows: number;
  isWin: boolean;
}

export function GuessRow({ index, guess, bulls, cows, isWin }: GuessRowProps) {
  return (
    <View style={[styles.container, isWin && styles.winContainer]}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index}</Text>
      </View>

      <View style={styles.digitsContainer}>
        {guess ? (
          guess.split('').map((d, i) => (
            <View key={i} style={styles.digitBox}>
              <Text style={styles.digit}>{d}</Text>
            </View>
          ))
        ) : (
          [0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.digitBox, styles.hiddenBox]}>
              <Text style={styles.hiddenDigit}>?</Text>
            </View>
          ))
        )}
      </View>

      <BullCowBadge bulls={bulls} cows={cows} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  winContainer: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryGlow,
  },
  indexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indexText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  digitsContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  digitBox: {
    width: 32,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenBox: {
    backgroundColor: Colors.surfaceBorder,
  },
  digit: {
    fontSize: FontSize.lg,
    color: Colors.textBright,
    fontWeight: '800',
  },
  hiddenDigit: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
