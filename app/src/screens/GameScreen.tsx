import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateGuess } from '@zihin-duellosu/shared';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { Strings } from '../constants/strings';
import { DigitInput } from '../components/DigitInput';
import { GuessList } from '../components/GuessList';
import { TurnIndicator } from '../components/TurnIndicator';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';

const bullIcon = require('../../assets/images/bull_icon.png');
const cowIcon = require('../../assets/images/cow_icon.png');

export function GameScreen() {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { submitGuess } = useGameActions();
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const round = useGameStore((s) => s.round);
  const myGuesses = useGameStore((s) => s.myGuesses);
  const opponentResults = useGameStore((s) => s.opponentResults);
  const opponentReconnecting = useGameStore((s) => s.opponentReconnecting);
  const reconnectCountdown = useGameStore((s) => s.reconnectCountdown);

  // Countdown timer for opponent reconnecting
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!opponentReconnecting || reconnectCountdown === null) {
      setCountdown(null);
      return;
    }
    setCountdown(reconnectCountdown);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [opponentReconnecting, reconnectCountdown]);

  const handleComplete = (value: string) => {
    setGuess(value);
    setError(null);
  };

  const handleClear = () => {
    setGuess('');
    setError(null);
  };

  const handleSend = () => {
    const validation = validateGuess(guess);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    submitGuess(guess);
    setGuess('');
    setError(null);
    setInputKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <TurnIndicator isMyTurn={isMyTurn} round={round} />

        {/* Guess List - Full Width Single Column */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>{Strings.gameScreen.moves}</Text>
          <View style={styles.listsContainer}>
            <GuessList
              title={Strings.gameScreen.yourGuesses}
              guesses={myGuesses}
              showDigits={true}
            />
            <View style={styles.listDivider} />
            <GuessList
              title={Strings.gameScreen.opponentGuesses}
              guesses={opponentResults}
              showDigits={false}
            />
          </View>
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.inputLabel}>{Strings.gameScreen.yourGuess}</Text>
          <DigitInput
            key={inputKey}
            compact
            disabled={!isMyTurn}
            onComplete={handleComplete}
            onClear={handleClear}
          />

          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!isMyTurn || !guess) && styles.sendButtonDisabled,
              pressed && isMyTurn && guess ? styles.btnPressed : null,
            ]}
            onPress={handleSend}
            disabled={!isMyTurn || !guess}
          >
            <Text style={styles.sendButtonText}>{Strings.gameScreen.send}</Text>
          </Pressable>

          {/* Bull/Cow Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Image source={bullIcon} style={styles.legendIcon} />
              <Text style={styles.legendBull}>dogru rakam, dogru yer</Text>
            </View>
            <View style={styles.legendItem}>
              <Image source={cowIcon} style={styles.legendIcon} />
              <Text style={styles.legendCow}>dogru rakam, yanlis yer</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Opponent Reconnecting Overlay */}
      {opponentReconnecting && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.overlayTitle}>Rakip yeniden baglaniyor...</Text>
            {countdown !== null && (
              <Text style={styles.overlayCountdown}>{countdown} saniye</Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  listSection: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textBright,
    marginBottom: Spacing.sm,
  },
  listsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  listDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  inputArea: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: ms(12),
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: ms(200),
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
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textBright,
    letterSpacing: ms(1),
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  legendIcon: {
    width: ms(35),
    height: ms(35),
    resizeMode: 'contain',
  },
  legendBull: {
    fontSize: FontSize.xs,
    color: Colors.bull,
    fontWeight: '600',
  },
  legendCow: {
    fontSize: FontSize.xs,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  overlayTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textBright,
  },
  overlayCountdown: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
});
