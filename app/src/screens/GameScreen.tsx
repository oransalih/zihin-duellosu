import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateGuess } from '@bull-cow/shared';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Strings } from '../constants/strings';
import { DigitInput } from '../components/DigitInput';
import { GuessList } from '../components/GuessList';
import { TurnIndicator } from '../components/TurnIndicator';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';

export function GameScreen() {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { submitGuess } = useGameActions();
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const round = useGameStore((s) => s.round);
  const myGuesses = useGameStore((s) => s.myGuesses);
  const opponentResults = useGameStore((s) => s.opponentResults);

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Turn Indicator */}
        <TurnIndicator isMyTurn={isMyTurn} round={round} />

        {/* Guess Lists */}
        <View style={styles.listsContainer}>
          <GuessList
            title={Strings.gameScreen.yourGuesses}
            guesses={myGuesses}
            showDigits={true}
          />
          <View style={styles.divider} />
          <GuessList
            title={Strings.gameScreen.opponentGuesses}
            guesses={opponentResults}
            showDigits={false}
          />
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <DigitInput
                key={inputKey}
                disabled={!isMyTurn}
                onComplete={handleComplete}
                onClear={handleClear}
              />
            </View>
          </View>

          <Pressable
            style={[
              styles.sendButton,
              (!isMyTurn || !guess) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!isMyTurn || !guess}
          >
            <Text style={styles.sendButtonText}>{Strings.gameScreen.send}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: Spacing.md,
  },
  listsContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  inputArea: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 160,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.background,
  },
});
