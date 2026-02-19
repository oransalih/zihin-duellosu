import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GuessRow } from './GuessRow';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { GuessResult, OpponentGuessResult } from '@zihin-duellosu/shared';
import { Strings } from '../constants/strings';

interface GuessListProps {
  title: string;
  guesses: (GuessResult | OpponentGuessResult)[];
  showDigits: boolean;
}

export function GuessList({ title, guesses, showDigits }: GuessListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {guesses.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{guesses.length}</Text>
          </View>
        )}
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {guesses.length === 0 ? (
          <Text style={styles.empty}>{Strings.gameScreen.noGuess}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: ms(1),
  },
  countBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: ms(8),
    paddingVertical: ms(2),
  },
  countText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  row: {
    marginBottom: ms(6),
  },
  empty: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
