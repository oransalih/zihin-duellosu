import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GuessRow } from './GuessRow';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { GuessResult, OpponentGuessResult } from '@bull-cow/shared';

interface GuessListProps {
  title: string;
  guesses: (GuessResult | OpponentGuessResult)[];
  showDigits: boolean;
}

export function GuessList({ title, guesses, showDigits }: GuessListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {guesses.length === 0 ? (
          <Text style={styles.empty}>Henuz tahmin yok</Text>
        ) : (
          guesses.map((g, i) => (
            <View key={i} style={styles.row}>
              <GuessRow
                index={i + 1}
                guess={showDigits && 'guess' in g ? g.guess : undefined}
                bulls={g.bulls}
                cows={g.cows}
                isWin={g.bulls === 4}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  list: {
    flex: 1,
  },
  row: {
    marginBottom: Spacing.xs,
  },
  empty: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
