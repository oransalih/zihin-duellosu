import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius, ms } from '../constants/theme';
import { BullCowBadge } from './BullCowBadge';

interface GuessRowProps {
  index: number;
  guess?: string;
  bulls: number;
  cows: number;
  isWin: boolean;
}

export function GuessRow({ index, guess, bulls, cows, isWin }: GuessRowProps) {
  const digits = guess ? guess.split('').join(' ') : '? ? ? ?';

  return (
    <View style={[styles.container, isWin && styles.winContainer]}>
      <Text style={styles.index}>{index}</Text>
      <Text style={[styles.digits, !guess && styles.hiddenDigits]}>{digits}</Text>
      <BullCowBadge bulls={bulls} cows={cows} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: ms(8),
    paddingVertical: ms(7),
    gap: ms(6),
  },
  winContainer: {
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryGlow,
  },
  index: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    width: ms(12),
    textAlign: 'center',
  },
  digits: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textBright,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: ms(3),
  },
  hiddenDigits: {
    color: Colors.textMuted,
  },
});
