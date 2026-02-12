import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateSecret } from '@bull-cow/shared';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { Strings } from '../constants/strings';
import { DigitInput } from '../components/DigitInput';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';

export function SetupScreen() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { submitSecret } = useGameActions();
  const mySecretSubmitted = useGameStore((s) => s.mySecretSubmitted);
  const opponentReady = useGameStore((s) => s.opponentReady);

  const handleComplete = (value: string) => {
    setSecret(value);
    setError(null);
  };

  const handleClear = () => {
    setSecret('');
    setError(null);
  };

  const handleConfirm = () => {
    const validation = validateSecret(secret);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }
    submitSecret(secret);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{Strings.setupScreen.title}</Text>
          <Text style={styles.subtitle}>{Strings.setupScreen.subtitle}</Text>
        </View>

        {mySecretSubmitted ? (
          <View style={styles.waitingContainer}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>OK</Text>
            </View>
            <Text style={styles.secretConfirmed}>Sayin kaydedildi</Text>

            <View style={styles.statusRow}>
              {opponentReady ? (
                <>
                  <View style={[styles.statusDot, styles.statusDotReady]} />
                  <Text style={styles.statusReady}>{Strings.setupScreen.opponentReady}</Text>
                </>
              ) : (
                <>
                  <ActivityIndicator color={Colors.primary} size="small" />
                  <Text style={styles.statusWaiting}>{Strings.setupScreen.waiting}</Text>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.inputSection}>
            <DigitInput masked onComplete={handleComplete} onClear={handleClear} />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.confirmButton, !secret && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!secret}
            >
              <Text style={styles.confirmButtonText}>{Strings.setupScreen.confirm}</Text>
            </Pressable>
          </View>
        )}
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  inputSection: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  waitingContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkmark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.primary,
  },
  secretConfirmed: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotReady: {
    backgroundColor: Colors.success,
  },
  statusReady: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: '600',
  },
  statusWaiting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
