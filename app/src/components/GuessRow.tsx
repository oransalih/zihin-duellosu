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
      <Text style={styles.index}>{index}</Text>
      {guess ? (
        <View style={styles.digits}>
          {guess.split('').map((d, i) => (
            <Text key={i} style={styles.digit}>{d}</Text>
          ))}
        </View>
      ) : (
        <View style={styles.digits}>
          {[0, 1, 2, 3].map((i) => (
            <Text key={i} style={styles.hiddenDigit}>?</Text>
          ))}
        </View>
      )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  winContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  index: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    width: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  digits: {
    flexDirection: 'row',
    flex: 1,
    gap: 6,
  },
  digit: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  hiddenDigit: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
});
