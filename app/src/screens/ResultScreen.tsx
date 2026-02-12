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
        {/* Result Icon & Text */}
        <View style={styles.resultHeader}>
          <View style={[styles.resultIcon, isWin ? styles.winIcon : isDraw ? styles.drawIcon : styles.loseIcon]}>
            <Text style={styles.resultEmoji}>
              {isWin ? 'W' : isDraw ? '=' : 'L'}
            </Text>
          </View>
          <Text style={[styles.resultText, isWin ? styles.winText : isDraw ? styles.drawText : styles.loseText]}>
            {isWin ? Strings.resultScreen.youWon : isDraw ? Strings.resultScreen.draw : Strings.resultScreen.youLost}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{result.yourGuessCount}</Text>
            <Text style={styles.statLabel}>{Strings.resultScreen.guessCount}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{Strings.resultScreen.opponentSecret}</Text>
            <View style={styles.secretDigits}>
              {result.opponentSecret.split('').map((d, i) => (
                <Text key={i} style={styles.secretDigit}>{d}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Reason */}
        <Text style={styles.reason}>{result.reason}</Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          {rematchPending ? (
            <View style={styles.rematchWaiting}>
              {rematchRequestedBy === 'you' ? (
                <>
                  <ActivityIndicator color={Colors.primary} size="small" />
                  <Text style={styles.rematchWaitingText}>{Strings.resultScreen.waitingRematch}</Text>
                </>
              ) : (
                <Pressable style={[styles.button, styles.primaryButton]} onPress={handleRematch}>
                  <Text style={styles.primaryButtonText}>Kabul Et</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable style={[styles.button, styles.primaryButton]} onPress={handleRematch}>
              <Text style={styles.primaryButtonText}>{Strings.resultScreen.rematch}</Text>
            </Pressable>
          )}

          <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleHome}>
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
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  resultHeader: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winIcon: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
  },
  loseIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  drawIcon: {
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
  },
  resultEmoji: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.text,
  },
  resultText: {
    fontSize: FontSize.title,
    fontWeight: '900',
  },
  winText: {
    color: Colors.primary,
  },
  loseText: {
    color: Colors.secondary,
  },
  drawText: {
    color: Colors.bull,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  secretDigits: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.xs,
  },
  secretDigit: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  reason: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.background,
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
