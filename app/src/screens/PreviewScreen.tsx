import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGameStore } from '../store/game-store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_GUESSES = [
  { guess: '1234', bulls: 1, cows: 2, round: 1 },
  { guess: '5678', bulls: 0, cows: 1, round: 2 },
  { guess: '1357', bulls: 2, cows: 1, round: 3 },
  { guess: '1397', bulls: 3, cows: 0, round: 4 },
];

const MOCK_OPPONENT = [
  { bulls: 0, cows: 3, round: 1 },
  { bulls: 1, cows: 1, round: 2 },
  { bulls: 1, cows: 2, round: 3 },
];

export function PreviewScreen() {
  const navigation = useNavigation<Nav>();
  const store = useGameStore;

  const previewSetup = () => {
    store.getState().reset();
    store.getState().setRoomId('preview-room');
    navigation.navigate('Setup', { roomId: 'preview-room' });
  };

  const previewGame = () => {
    store.getState().reset();
    store.getState().setConnected(true);
    store.getState().startGame(true, 5);
    MOCK_GUESSES.forEach((g) => store.getState().addMyGuess(g));
    MOCK_OPPONENT.forEach((g) => store.getState().addOpponentResult(g));
    navigation.navigate('Game');
  };

  const previewWin = () => {
    navigation.navigate('Result', {
      result: {
        winner: 'you',
        yourGuessCount: 5,
        opponentGuessCount: 7,
        opponentSecret: '9382',
        reason: 'Rakibinden once buldun!',
      },
    });
  };

  const previewLose = () => {
    navigation.navigate('Result', {
      result: {
        winner: 'opponent',
        yourGuessCount: 8,
        opponentGuessCount: 6,
        opponentSecret: '4561',
        reason: 'Rakibin daha once buldu.',
      },
    });
  };

  const previewDraw = () => {
    navigation.navigate('Result', {
      result: {
        winner: 'draw',
        yourGuessCount: 5,
        opponentGuessCount: 5,
        opponentSecret: '7210',
        reason: 'Ayni turda buldunuz!',
      },
    });
  };

  const goBack = () => {
    store.getState().reset();
    navigation.navigate('Start');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ekran Onizleme</Text>
        <Text style={styles.subtitle}>Sahte verilerle ekranlari gezin</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oyun Akisi</Text>
          <Btn label="Sayi Secme Ekrani" onPress={previewSetup} />
          <Btn label="Oyun Ekrani (sahte tahminlerle)" onPress={previewGame} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sonuc Ekranlari</Text>
          <Btn label="Kazanma Ekrani" onPress={previewWin} color={Colors.textGreen} />
          <Btn label="Kaybetme Ekrani" onPress={previewLose} color={Colors.secondary} />
          <Btn label="Berabere Ekrani" onPress={previewDraw} color={Colors.bull} />
        </View>

        <Pressable style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backBtnText}>Ana Ekrana Don</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Btn({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      onPress={onPress}
    >
      <Text style={[styles.btnText, color ? { color } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textBright,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  btn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  backBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
