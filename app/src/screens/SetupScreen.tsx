import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateSecret } from '@zihin-duellosu/shared';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
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
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{Strings.setupScreen.title}</Text>
            <Text style={styles.subtitle}>{Strings.setupScreen.subtitle}</Text>
          </View>

          {mySecretSubmitted ? (
            <View style={styles.waitingContainer}>
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>OK</Text>
              </View>
              <Text style={styles.secretConfirmed}>{Strings.setupScreen.secretSaved}</Text>

              <View style={styles.statusRow}>
                {opponentReady ? (
                  <>
                    <View style={[styles.statusDot, styles.statusDotReady]} />
                    <Text style={styles.statusReady}>{Strings.setupScreen.opponentReady}</Text>
                  </>
                ) : (
                  <>
                    <ActivityIndicator color={Colors.primaryLight} size="small" />
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
                style={({ pressed }) => [
                  styles.confirmButton,
                  !secret && styles.confirmButtonDisabled,
                  pressed && secret ? styles.btnPressed : null,
                ]}
                onPress={handleConfirm}
                disabled={!secret}
              >
                <Text style={styles.confirmButtonText}>{Strings.setupScreen.confirm}</Text>
              </Pressable>
            </View>
          )}
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
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textBright,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
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
    paddingVertical: ms(14),
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    minWidth: ms(200),
    alignItems: 'center',
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
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textBright,
    letterSpacing: ms(2),
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  waitingContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  checkmark: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  checkmarkText: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.primaryLight,
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
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
  },
  statusDotReady: {
    backgroundColor: Colors.primaryLight,
  },
  statusReady: {
    fontSize: FontSize.md,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  statusWaiting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
