import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateGuess } from '@zihin-duellosu/shared';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation } from '../i18n';
import { DigitInput } from '../components/DigitInput';
import { GuessList } from '../components/GuessList';
import { TurnIndicator } from '../components/TurnIndicator';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';
import { useProfileStore } from '../store/profile-store';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bullIcon = require('../../assets/images/bull_icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cowIcon = require('../../assets/images/cow_icon.png');

export function GameScreen() {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { t } = useTranslation();
  const { submitGuess } = useGameActions();

  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const myGuesses = useGameStore((s) => s.myGuesses);
  const opponentResults = useGameStore((s) => s.opponentResults);
  const mySecret = useGameStore((s) => s.mySecret);
  const opponentReconnecting = useGameStore((s) => s.opponentReconnecting);
  const reconnectCountdown = useGameStore((s) => s.reconnectCountdown);
  const connected = useGameStore((s) => s.connected);
  const opponentUsername = useGameStore((s) => s.opponentUsername);
  const myUsername = useProfileStore((s) => s.profile.username);

  const opponentGuessCount = opponentResults.length;
  const opponentDisplayName = opponentUsername || t.game.opponent;
  const myDisplayName = myUsername || t.game.you;

  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (!opponentReconnecting || reconnectCountdown === null) { setCountdown(null); return; }
    setCountdown(reconnectCountdown);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [opponentReconnecting, reconnectCountdown]);

  const handleComplete = (value: string) => { setGuess(value); setError(null); };
  const handleClear = () => { setGuess(''); setError(null); };

  const handleSend = () => {
    const validation = validateGuess(guess);
    if (!validation.valid) { setError(validation.error!); return; }
    submitGuess(guess);
    setGuess(''); setError(null); setInputKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TurnIndicator isMyTurn={isMyTurn} mySecret={mySecret} />

        {/* Player labels with live guess count */}
        <View style={styles.playerLabels}>
          <Text style={styles.myLabel}>{myDisplayName}</Text>
          <View style={styles.opponentLabelRow}>
            <Text style={styles.opponentLabel} numberOfLines={1}>{opponentDisplayName}</Text>
            {opponentGuessCount > 0 && (
              <View style={styles.opponentCountBadge}>
                <Text style={styles.opponentCountText}>{t.game.opponentMoves(opponentGuessCount)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.listSection}>
          <View style={styles.listsContainer}>
            <GuessList title={t.game.yourGuesses} guesses={myGuesses} showDigits={true} />
            <View style={styles.listDivider} />
            <GuessList title={t.game.opponentGuesses} guesses={opponentResults} showDigits={false} />
          </View>
        </View>

        <View style={styles.inputArea}>
          {error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.inputLabel}>{t.game.yourGuess}</Text>
          <DigitInput key={inputKey} compact disabled={!isMyTurn} onComplete={handleComplete} onClear={handleClear} />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!isMyTurn || !guess) && styles.sendButtonDisabled,
              pressed && isMyTurn && guess ? styles.btnPressed : null,
            ]}
            onPress={handleSend}
            disabled={!isMyTurn || !guess}
          >
            <Text style={styles.sendButtonText}>{t.game.send}</Text>
          </Pressable>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Image source={bullIcon} style={styles.legendIcon} />
              <Text style={styles.legendBull}>{t.game.bullHint}</Text>
            </View>
            <View style={styles.legendItem}>
              <Image source={cowIcon} style={styles.legendIcon} />
              <Text style={styles.legendCow}>{t.game.cowHint}</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {opponentReconnecting && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.overlayTitle}>{t.connection.opponentReconnecting}</Text>
            <Text style={styles.overlaySubtitle}>{t.connection.opponentReconnectingSub}</Text>
            {countdown !== null && (
              <Text style={styles.overlayCountdown}>{countdown} {t.connection.timeoutSuffix}</Text>
            )}
          </View>
        </View>
      )}

      {!connected && (
        <View style={styles.overlay}>
          <View style={[styles.overlayContent, styles.overlayContentWarning]}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.overlayTitle}>{t.connection.selfDisconnected}</Text>
            <Text style={styles.overlaySubtitle}>{t.connection.selfReconnecting}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  playerLabels: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xs, paddingBottom: Spacing.xs,
  },
  myLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textGreen, flex: 1 },
  opponentLabelRow: {
    flex: 1, flexDirection: 'row', justifyContent: 'flex-end',
    alignItems: 'center', gap: Spacing.xs,
  },
  opponentLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, maxWidth: ms(90) },
  opponentCountBadge: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.sm,
    paddingHorizontal: ms(6), paddingVertical: ms(2),
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  opponentCountText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  listSection: { flex: 1 },
  listsContainer: { flex: 1, flexDirection: 'row', gap: Spacing.sm },
  listDivider: { width: 1, backgroundColor: Colors.border },
  inputArea: {
    paddingVertical: Spacing.md, gap: Spacing.sm, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.surfaceBorder,
  },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  error: { fontSize: FontSize.sm, color: Colors.error, textAlign: 'center' },
  sendButton: {
    backgroundColor: Colors.primary, paddingVertical: ms(12), paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, alignItems: 'center', minWidth: ms(200),
    borderWidth: 1.5, borderColor: Colors.primaryLight, borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  sendButtonDisabled: { opacity: 0.3 },
  sendButtonText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textBright, letterSpacing: ms(1) },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  legend: { flexDirection: 'row', gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: ms(4) },
  legendIcon: { width: ms(32), height: ms(32), resizeMode: 'contain' },
  legendBull: { fontSize: FontSize.xs, color: Colors.bull, fontWeight: '600' },
  legendCow: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  overlayContent: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, maxWidth: ms(280),
  },
  overlayTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textBright, textAlign: 'center' },
  overlaySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  overlayCountdown: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primaryLight },
  overlayContentWarning: { borderColor: Colors.accent },
});
