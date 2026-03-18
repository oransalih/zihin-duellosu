import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Share,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation } from '../i18n';
import { useSocket } from '../hooks/useSocket';
import { useGameEvents, useAppStateHandler } from '../hooks/useGame';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useGameStore } from '../store/game-store';
import { useProfileStore } from '../store/profile-store';
import { RulesModal } from '../components/RulesModal';
import { RootStackParamList } from '../navigation/RootNavigator';

const logoImg = require('../../assets/images/logo.png');

const bannerAdUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      ios: 'ca-app-pub-6498195844154887/8725394446',
      android: 'ca-app-pub-6498195844154887/7366308215',
    })!;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StartScreen() {
  useSocket();
  useGameEvents();
  useAppStateHandler();

  const { t, language, setLanguage } = useTranslation();
  const navigation = useNavigation<Nav>();

  const connected = useGameStore((s) => s.connected);
  const { matchmakingStatus, roomCode, joinQueue, leaveQueue, createRoom, joinRoom } = useMatchmaking();

  const username = useProfileStore((s) => s.profile.username);

  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);

  // Elapsed wait time
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const waitStartRef = useRef<number | null>(null);

  useEffect(() => {
    const isWaiting = matchmakingStatus === 'queuing' || matchmakingStatus === 'waiting_for_opponent';
    if (isWaiting) {
      if (waitStartRef.current === null) {
        waitStartRef.current = Date.now();
        setElapsedSeconds(0);
      }
      const interval = setInterval(() => {
        if (waitStartRef.current !== null) {
          setElapsedSeconds(Math.floor((Date.now() - waitStartRef.current) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      waitStartRef.current = null;
      setElapsedSeconds(0);
    }
  }, [matchmakingStatus]);

  const handleQuickMatch = () => {
    if (matchmakingStatus === 'queuing') {
      leaveQueue();
    } else {
      joinQueue();
    }
  };

  const handleShareRoom = async () => {
    if (roomCode) {
      try {
        await Share.share({ message: `Zihin Düellosu'na katıl! Oda kodu: ${roomCode}` });
      } catch {}
    }
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      joinRoom(joinCode);
      setShowJoinInput(false);
      setJoinCode('');
    }
  };

  const isWaiting = matchmakingStatus === 'queuing' || matchmakingStatus === 'waiting_for_opponent';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.connRow}>
            <View style={[styles.connDot, connected ? styles.connOn : styles.connOff]} />
            <Text style={styles.connText}>{connected ? t.start.connected : t.start.connecting}</Text>
          </View>

          <View style={styles.topActions}>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={() => setRulesVisible(true)}
            >
              <Text style={styles.iconBtnText}>?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.usernameChip,
                !username && styles.usernameChipEmpty,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('ProfileSetup')}
            >
              <Text style={[styles.usernameText, !username && styles.usernameTextEmpty]}>
                {username ? `👤 ${username}` : `+ ${t.start.setUsername}`}
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Image source={logoImg} style={styles.logo} />
            <Text style={styles.title}>{t.app.title}</Text>
            <View style={styles.subtitleLine} />
            <Text style={styles.subtitle}>{t.app.subtitle}</Text>
          </View>

          {/* Banner Ad */}
          <View style={styles.adContainer}>
            <BannerAd
              unitId={bannerAdUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Quick Match */}
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                isWaiting && styles.btnActive,
                pressed && styles.btnPressed,
              ]}
              onPress={handleQuickMatch}
              disabled={matchmakingStatus === 'waiting_for_opponent'}
            >
              {matchmakingStatus === 'queuing' ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color={Colors.textBright} size="small" />
                  <Text style={styles.btnPrimaryText}>{t.start.waiting}</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>{t.start.play}</Text>
              )}
            </Pressable>

            {/* Wait info */}
            {isWaiting && elapsedSeconds > 0 && (
              <View style={styles.waitInfoRow}>
                <Text style={styles.waitInfoText}>{t.start.elapsedWait(elapsedSeconds)}</Text>
                <Pressable
                  onPress={leaveQueue}
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelBtnText}>{t.start.cancelQueue}</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.description}>{t.start.description}</Text>

            <View style={styles.divider} />

            {/* Room Code Display or Create */}
            {roomCode ? (
              <View style={styles.roomCodeBox}>
                <Text style={styles.roomLabel}>{t.start.roomCode}</Text>
                <Text style={styles.roomCode}>{roomCode}</Text>
                <Pressable
                  style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnPressed]}
                  onPress={handleShareRoom}
                >
                  <Text style={styles.btnSecondaryText}>{t.start.share}</Text>
                </Pressable>
                {matchmakingStatus === 'waiting_for_opponent' && (
                  <View style={styles.waitRow}>
                    <ActivityIndicator color={Colors.primaryLight} size="small" />
                    <Text style={styles.waitText}>{t.start.waitingOpponent}</Text>
                  </View>
                )}
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && styles.btnPressed,
                  isWaiting && styles.btnDisabled,
                ]}
                onPress={() => createRoom()}
                disabled={isWaiting}
              >
                <Text style={styles.btnSecondaryText}>{t.start.createRoom}</Text>
              </Pressable>
            )}

            {/* Join Room */}
            {showJoinInput ? (
              <View style={styles.joinRow}>
                <TextInput
                  style={styles.joinInput}
                  value={joinCode}
                  onChangeText={(v) => setJoinCode(v.toUpperCase())}
                  placeholder="ABCDEF"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoFocus
                />
                <Pressable
                  style={[styles.joinBtn, joinCode.length !== 6 && styles.btnDisabled]}
                  onPress={handleJoinRoom}
                  disabled={joinCode.length !== 6}
                >
                  <Text style={styles.joinBtnText}>{'>'}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnOutline,
                  pressed && styles.btnPressed,
                  isWaiting && styles.btnDisabled,
                ]}
                onPress={() => setShowJoinInput(true)}
                disabled={isWaiting}
              >
                <Text style={styles.btnOutlineText}>{t.start.joinRoom}</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RulesModal visible={rulesVisible} onClose={() => setRulesVisible(false)} />

      {/* Language toggle — bottom right */}
      <View style={styles.langToggle} pointerEvents="box-none">
        <Pressable
          style={({ pressed }) => [styles.langBtn, language === 'tr' && styles.langBtnActive, pressed && styles.pressed]}
          onPress={() => setLanguage('tr')}
        >
          <Text style={[styles.langBtnText, language === 'tr' && styles.langBtnTextActive]}>TR</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.langBtn, language === 'en' && styles.langBtnActive, pressed && styles.pressed]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>EN</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  connDot: { width: ms(6), height: ms(6), borderRadius: ms(3) },
  connOn: { backgroundColor: Colors.primaryLight },
  connOff: { backgroundColor: Colors.error },
  connText: { fontSize: FontSize.xs, color: Colors.textMuted },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: {
    width: ms(32), height: ms(32), borderRadius: ms(16),
    backgroundColor: Colors.surfaceLight, borderWidth: 1,
    borderColor: Colors.surfaceBorder, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textSecondary },
  usernameChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: ms(6),
    borderWidth: 1, borderColor: Colors.surfaceBorder, maxWidth: ms(160),
  },
  usernameChipEmpty: { borderColor: Colors.primary, borderStyle: 'dashed' },
  usernameText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textBright },
  usernameTextEmpty: { color: Colors.textGreen },
  content: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  titleContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: ms(160), height: ms(160), resizeMode: 'contain', marginBottom: Spacing.md },
  title: {
    fontSize: FontSize.hero, fontWeight: '900', color: Colors.textBright,
    textAlign: 'center', lineHeight: ms(50), letterSpacing: ms(3),
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6,
  },
  subtitleLine: { width: ms(80), height: ms(2), backgroundColor: Colors.primary, marginVertical: Spacing.sm + ms(2) },
  subtitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textGreen, letterSpacing: ms(4) },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    padding: Spacing.lg, gap: Spacing.md,
  },
  btn: { paddingVertical: ms(14), borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btnPrimary: {
    backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.primaryLight,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  btnActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primary },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  btnPrimaryText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textBright, letterSpacing: ms(2) },
  btnSecondary: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder },
  btnSecondaryText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, letterSpacing: ms(1) },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  btnOutlineText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary, letterSpacing: ms(1) },
  btnDisabled: { opacity: 0.3 },
  waitInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  waitInfoText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cancelBtn: { paddingHorizontal: Spacing.sm, paddingVertical: ms(4) },
  cancelBtnText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '700' },
  description: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: ms(20) },
  divider: { height: 1, backgroundColor: Colors.surfaceBorder },
  roomCodeBox: {
    alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  roomLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  roomCode: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textGreen, letterSpacing: ms(8) },
  waitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  waitText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  joinRow: { flexDirection: 'row', gap: Spacing.sm },
  joinInput: {
    flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder, paddingHorizontal: Spacing.md,
    fontSize: FontSize.lg, color: Colors.textBright, fontWeight: '800',
    letterSpacing: ms(6), textAlign: 'center', height: ms(50),
  },
  joinBtn: {
    width: ms(50), height: ms(50), borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  joinBtnText: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textBright },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  adContainer: { alignItems: 'center', marginBottom: Spacing.sm },
  langToggle: {
    position: 'absolute', bottom: Spacing.md, right: Spacing.md,
    flexDirection: 'row', gap: ms(4),
  },
  langBtn: {
    paddingHorizontal: ms(10), paddingVertical: ms(6),
    borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceLight,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  langBtnActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryLight },
  langBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted },
  langBtnTextActive: { color: Colors.textBright },
});
