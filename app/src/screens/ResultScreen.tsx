import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation } from '../i18n';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGameActions } from '../hooks/useGame';
import { useGameStore } from '../store/game-store';
import { useRematchTimeout } from '../hooks/useRematchTimeout';
import { useProfileStore } from '../store/profile-store';
import { disconnectSocket } from '../services/socket';

const bannerAdUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      ios: 'ca-app-pub-6498195844154887/8725394446',
      android: 'ca-app-pub-6498195844154887/7366308215',
    })!;

const trophyImg = require('../../assets/images/trophy.png');
const defeatImg = require('../../assets/images/defeat.png');
const drawImg = require('../../assets/images/draw.png');

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ResultScreen() {
  const route = useRoute<ResultRouteProp>();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { requestRematch } = useGameActions();

  const rematchPending = useGameStore((s) => s.rematchPending);
  const rematchRequestedBy = useGameStore((s) => s.rematchRequestedBy);
  const rematchTimedOut = useGameStore((s) => s.rematchTimedOut);
  const recordResult = useProfileStore((s) => s.recordResult);

  const { result } = route.params;
  const isWin = result.winner === 'you';
  const isDraw = result.winner === 'draw';

  const statsRecorded = useRef(false);
  useEffect(() => {
    if (!statsRecorded.current) {
      statsRecorded.current = true;
      void recordResult(result.winner, result.yourGuessCount);
    }
  }, [result, recordResult]);

  useRematchTimeout();

  const handleHome = () => {
    useGameStore.getState().reset();
    disconnectSocket();
    navigation.navigate('Start');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={isWin ? trophyImg : isDraw ? drawImg : defeatImg} style={styles.resultIcon} />

        <Text style={styles.gameOverText}>{t.result.gameOver}</Text>

        <Text style={[styles.resultText, isWin ? styles.winText : isDraw ? styles.drawText : styles.loseText]}>
          {isWin ? t.result.youWon : isDraw ? t.result.draw : t.result.youLost}
        </Text>

        {isWin && <Text style={styles.winInfo}>{t.result.movesWin(result.yourGuessCount)}</Text>}

        <View style={styles.secretCard}>
          <Text style={styles.secretLabel}>{t.result.opponentSecret}</Text>
          <View style={styles.secretDigits}>
            {result.opponentSecret.split('').map((d, i) => (
              <View key={i} style={styles.secretDigitBox}>
                <Text style={styles.secretDigit}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t.result.yourMoves}</Text>
            <Text style={styles.statValue}>{result.yourGuessCount}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{t.result.opponentMoves}</Text>
            <Text style={styles.statValue}>{result.opponentGuessCount}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          {rematchTimedOut ? (
            <View style={styles.timeoutBox}>
              <Text style={styles.timeoutText}>{t.result.rematchTimeout}</Text>
              <Text style={styles.timeoutSub}>{t.result.rematchTimeoutSub}</Text>
            </View>
          ) : rematchPending ? (
            <View style={styles.rematchWaiting}>
              {rematchRequestedBy === 'you' ? (
                <>
                  <ActivityIndicator color={Colors.primaryLight} size="small" />
                  <Text style={styles.rematchWaitingText}>{t.result.waitingRematch}</Text>
                </>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.btnPressed]}
                  onPress={requestRematch}
                >
                  <Text style={styles.primaryButtonText}>{t.result.accept}</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.btnPressed]}
              onPress={requestRematch}
            >
              <Text style={styles.primaryButtonText}>{t.result.rematch}</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.btnPressed]}
            onPress={handleHome}
          >
            <Text style={styles.secondaryButtonText}>{t.result.home}</Text>
          </Pressable>
        </View>
      </View>

      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg, gap: Spacing.md },
  resultIcon: { width: ms(96), height: ms(96), resizeMode: 'contain' },
  gameOverText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textSecondary, letterSpacing: ms(2) },
  resultText: {
    fontSize: FontSize.hero, fontWeight: '900', letterSpacing: ms(2),
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6,
  },
  winText: { color: Colors.textGreen },
  loseText: { color: Colors.secondary },
  drawText: { color: Colors.bull },
  winInfo: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: '600' },
  secretCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    padding: Spacing.lg, alignItems: 'center', width: '100%', gap: Spacing.sm, marginTop: Spacing.sm,
  },
  secretLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600' },
  secretDigits: { flexDirection: 'row', gap: Spacing.sm },
  secretDigitBox: {
    width: ms(52), height: ms(60), borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  secretDigit: { fontSize: FontSize.title, fontWeight: '900', color: Colors.textGreen },
  statsContainer: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    padding: Spacing.md, width: '100%', gap: Spacing.sm,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  statLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textBright },
  statDivider: { height: 1, backgroundColor: Colors.surfaceBorder },
  buttons: { width: '100%', gap: Spacing.md, marginTop: Spacing.md },
  button: { paddingVertical: ms(14), borderRadius: BorderRadius.md, alignItems: 'center' },
  primaryButton: {
    backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.primaryLight,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  primaryButtonText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textBright, letterSpacing: ms(2) },
  secondaryButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  secondaryButtonText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  rematchWaiting: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
  },
  rematchWaitingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  timeoutBox: {
    alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, paddingHorizontal: Spacing.lg,
  },
  timeoutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  timeoutSub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
});
