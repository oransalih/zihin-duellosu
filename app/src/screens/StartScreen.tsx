import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { Strings } from '../constants/strings';
import { useSocket } from '../hooks/useSocket';
import { useGameEvents } from '../hooks/useGame';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useGameStore } from '../store/game-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const logoImg = require('../../assets/images/logo.png');

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StartScreen() {
  useSocket();
  useGameEvents();

  const navigation = useNavigation<Nav>();
  const connected = useGameStore((s) => s.connected);
  const { matchmakingStatus, roomCode, joinQueue, leaveQueue, createRoom, joinRoom } = useMatchmaking();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleQuickMatch = () => {
    if (matchmakingStatus === 'queuing') {
      leaveQueue();
    } else {
      joinQueue();
    }
  };

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleShareRoom = async () => {
    if (roomCode) {
      try {
        await Share.share({
          message: `Zihin Duellosu'na katil! Oda kodu: ${roomCode}`,
        });
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
      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.connRow}>
          <View style={[styles.connDot, connected ? styles.connOn : styles.connOff]} />
          <Text style={styles.connText}>{connected ? 'Bagli' : 'Baglaniyor...'}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Image source={logoImg} style={styles.logo} />
          <Text style={styles.title}>{Strings.appTitle}</Text>
          <View style={styles.subtitleLine} />
          <Text style={styles.subtitle}>{Strings.appSubtitle}</Text>
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
                <Text style={styles.btnPrimaryText}>{Strings.startScreen.waiting}</Text>
              </View>
            ) : (
              <Text style={styles.btnPrimaryText}>{Strings.startScreen.play}</Text>
            )}
          </Pressable>

          <Text style={styles.description}>{Strings.startScreen.description}</Text>

          <View style={styles.divider} />

          {/* Room Code Display or Create */}
          {roomCode ? (
            <View style={styles.roomCodeBox}>
              <Text style={styles.roomLabel}>{Strings.startScreen.roomCode}</Text>
              <Text style={styles.roomCode}>{roomCode}</Text>
              <Pressable
                style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnPressed]}
                onPress={handleShareRoom}
              >
                <Text style={styles.btnSecondaryText}>{Strings.startScreen.share}</Text>
              </Pressable>
              {matchmakingStatus === 'waiting_for_opponent' && (
                <View style={styles.waitRow}>
                  <ActivityIndicator color={Colors.primaryLight} size="small" />
                  <Text style={styles.waitText}>{Strings.startScreen.waitingOpponent}</Text>
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
              onPress={handleCreateRoom}
              disabled={isWaiting}
            >
              <Text style={styles.btnSecondaryText}>{Strings.startScreen.inviteLink}</Text>
            </Pressable>
          )}

          {/* Join Room */}
          {showJoinInput ? (
            <View style={styles.joinRow}>
              <TextInput
                style={styles.joinInput}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
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
              <Text style={styles.btnOutlineText}>{Strings.startScreen.joinRoom}</Text>
            </Pressable>
          )}
        </View>

        {/* Preview Mode */}
        <Pressable
          style={({ pressed }) => [styles.previewBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.navigate('Preview')}
        >
          <Text style={styles.previewBtnText}>Ekranlari Gez</Text>
        </Pressable>
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
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    position: 'absolute',
    top: ms(16),
    left: 0,
    right: 0,
  },
  connDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
  },
  connOn: { backgroundColor: Colors.primaryLight },
  connOff: { backgroundColor: Colors.error },
  connText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: ms(120),
    height: ms(120),
    resizeMode: 'contain',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    color: Colors.textBright,
    textAlign: 'center',
    lineHeight: ms(50),
    letterSpacing: ms(3),
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitleLine: {
    width: ms(80),
    height: ms(2),
    backgroundColor: Colors.primary,
    marginVertical: Spacing.sm + ms(2),
  },
  subtitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textGreen,
    letterSpacing: ms(4),
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  btn: {
    paddingVertical: ms(14),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btnPrimary: {
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
  btnActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  btnPrimaryText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textBright,
    letterSpacing: ms(2),
  },
  btnSecondary: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  btnSecondaryText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: ms(1),
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnOutlineText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: ms(1),
  },
  btnDisabled: {
    opacity: 0.3,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: ms(20),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  roomCodeBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  roomLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  roomCode: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textGreen,
    letterSpacing: ms(8),
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  waitText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  joinRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  joinInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textBright,
    fontWeight: '800',
    letterSpacing: ms(6),
    textAlign: 'center',
    height: ms(50),
  },
  joinBtn: {
    width: ms(50),
    height: ms(50),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  joinBtnText: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textBright,
  },
  previewBtn: {
    marginTop: Spacing.md,
    paddingVertical: ms(10),
    alignItems: 'center',
  },
  previewBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
