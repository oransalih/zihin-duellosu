import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { Strings } from '../constants/strings';

interface TurnIndicatorProps {
  isMyTurn: boolean;
  mySecret?: string | null;
}

export function TurnIndicator({ isMyTurn, mySecret }: TurnIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMyTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMyTurn]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.indicator,
            isMyTurn ? styles.myTurnBg : styles.opponentTurnBg,
            !isMyTurn && { opacity: pulseAnim },
          ]}
        >
          <View style={[styles.dot, isMyTurn ? styles.dotActive : styles.dotWaiting]} />
          <Text style={[styles.turnText, isMyTurn ? styles.turnTextActive : styles.turnTextWaiting]}>
            {isMyTurn ? Strings.gameScreen.yourTurn : Strings.gameScreen.opponentTurn}
          </Text>
        </Animated.View>

        {mySecret ? (
          <View style={styles.secretBadge}>
            <Text style={styles.secretLabel}>Sayın</Text>
            <Text style={styles.secretValue}>{mySecret.split('').join(' ')}</Text>
          </View>
        ) : (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{Strings.gameScreen.active}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  myTurnBg: {
    backgroundColor: Colors.primaryGlow,
  },
  opponentTurnBg: {
    backgroundColor: Colors.accentGlow,
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  dotActive: {
    backgroundColor: Colors.primaryLight,
  },
  dotWaiting: {
    backgroundColor: Colors.accentLight,
  },
  turnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  turnTextActive: {
    color: Colors.textGreen,
  },
  turnTextWaiting: {
    color: Colors.accentLight,
  },
  secretBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  secretLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    lineHeight: ms(14),
  },
  secretValue: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: '900',
    letterSpacing: ms(3),
    lineHeight: ms(16),
  },
  statusBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
