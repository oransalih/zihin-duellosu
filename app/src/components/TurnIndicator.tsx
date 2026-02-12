import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Strings } from '../constants/strings';

interface TurnIndicatorProps {
  isMyTurn: boolean;
  round: number;
}

export function TurnIndicator({ isMyTurn, round }: TurnIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isMyTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMyTurn]);

  return (
    <View style={styles.container}>
      <Text style={styles.round}>{Strings.gameScreen.round} {round}</Text>
      <Animated.View
        style={[
          styles.indicator,
          isMyTurn ? styles.myTurn : styles.opponentTurn,
          !isMyTurn && { opacity: pulseAnim },
        ]}
      >
        <View style={[styles.dot, isMyTurn ? styles.dotActive : styles.dotWaiting]} />
        <Text style={[styles.text, isMyTurn ? styles.textActive : styles.textWaiting]}>
          {isMyTurn ? Strings.gameScreen.yourTurn : Strings.gameScreen.opponentTurn}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  round: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  myTurn: {
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
  },
  opponentTurn: {
    backgroundColor: 'rgba(136, 136, 170, 0.15)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  dotWaiting: {
    backgroundColor: Colors.textSecondary,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  textActive: {
    color: Colors.primary,
  },
  textWaiting: {
    color: Colors.textSecondary,
  },
});
