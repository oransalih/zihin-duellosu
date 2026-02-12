import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Strings } from '../constants/strings';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';
import { disconnectSocket } from '../services/socket';

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ResultScreen() {
  const route = useRoute<ResultRouteProp>();
  const navigation = useNavigation<Nav>();
  const { requestRematch } = useGameActions();
  const rematchPending = useGameStore((s) => s.rematchPending);
  const rematchRequestedBy = useGameStore((s) => s.rematchRequestedBy);

  const { result } = route.params;
  const isWin = result.winner === 'you';
  const isDraw = result.winner === 'draw';

  const handleRematch = () => {
    requestRematch();
  };

  const handleHome = () => {
    useGameStore.getState().reset();
    disconnectSocket();
    navigation.navigate('Start');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Game Over Header */}
        <Text style={styles.gameOverText}>{Strings.resultScreen.gameOver}</Text>

        {/* Result */}
        <Text style={[styles.resultText, isWin ? styles.winText : isDraw ? styles.drawText : styles.loseText]}>
          {isWin ? Strings.resultScreen.youWon : isDraw ? Strings.resultScreen.draw : Strings.resultScreen.youLost}
        </Text>

        {/* Win info */}
        {isWin && (
          <Text style={styles.winInfo}>
            {result.yourGuessCount} {Strings.resultScreen.movesWin}
          </Text>
        )}

        {/* Opponent Secret Card */}
        <View style={styles.secretCard}>
          <Text style={styles.secretLabel}>{Strings.resultScreen.opponentSecret}</Text>
          <View style={styles.secretDigits}>
            {result.opponentSecret.split('').map((d, i) => (
              <View key={i} style={styles.secretDigitBox}>
                <Text style={styles.secretDigit}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{Strings.resultScreen.yourMoves}</Text>
            <Text style={styles.statValue}>{result.yourGuessCount}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{Strings.resultScreen.opponentMoves}</Text>
            <Text style={styles.statValue}>{result.opponentGuessCount}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {rematchPending ? (
            <View style={styles.rematchWaiting}>
              {rematchRequestedBy === 'you' ? (
                <>
                  <ActivityIndicator color={Colors.primaryLight} size="small" />
                  <Text style={styles.rematchWaitingText}>{Strings.resultScreen.waitingRematch}</Text>
                </>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.btnPressed]}
                  onPress={handleRematch}
                >
                  <Text style={styles.primaryButtonText}>{Strings.resultScreen.accept}</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.btnPressed]}
              onPress={handleRematch}
            >
              <Text style={styles.primaryButtonText}>{Strings.resultScreen.newGame}</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.btnPressed]}
            onPress={handleHome}
          >
            <Text style={styles.secondaryButtonText}>{Strings.resultScreen.home}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  gameOverText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  resultText: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  winText: {
    color: Colors.textGreen,
  },
  loseText: {
    color: Colors.secondary,
  },
  drawText: {
    color: Colors.bull,
  },
  winInfo: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  secretCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  secretLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  secretDigits: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secretDigitBox: {
    width: 52,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  secretDigit: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.textGreen,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    width: '100%',
    gap: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textBright,
  },
  statDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  buttons: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  button: {
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textBright,
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  rematchWaiting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  rematchWaitingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
