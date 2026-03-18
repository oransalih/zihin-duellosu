import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation, Language } from '../i18n';
import { useProfileStore } from '../store/profile-store';
import { validateUsername } from '../services/profile-repository';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { t, language, setLanguage } = useTranslation();
  const { profile, stats, setUsername } = useProfileStore();


  const [inputValue, setInputValue] = useState(profile.username);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getValidationMessage = (code: string): string => {
    switch (code) {
      case 'required': return t.profile.validation.required;
      case 'tooShort': return t.profile.validation.tooShort;
      case 'tooLong': return t.profile.validation.tooLong;
      case 'invalidChars': return t.profile.validation.invalidChars;
      default: return t.errors.generic;
    }
  };

  const handleSave = async () => {
    const result = validateUsername(inputValue);
    if (!result.valid) {
      setError(getValidationMessage(result.error!));
      return;
    }
    setSaving(true);
    await setUsername(inputValue.trim());
    setSaving(false);
    navigation.goBack();
  };

  const handleLanguageToggle = async (lang: Language) => {
    await setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t.profile.title}</Text>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Username Input */}
          <View style={styles.card}>
            <Text style={styles.label}>{t.profile.usernameLabel}</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={inputValue}
              onChangeText={(v) => {
                setInputValue(v);
                setError(null);
              }}
              placeholder={t.profile.usernamePlaceholder}
              placeholderTextColor={Colors.textMuted}
              maxLength={16}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={!profile.username}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                saving && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{t.profile.save}</Text>
            </Pressable>
          </View>

          {/* Language */}
          <View style={styles.card}>
            <Text style={styles.label}>{t.profile.language}</Text>
            <View style={styles.langRow}>
              <Pressable
                style={[styles.langBtn, language === 'tr' && styles.langBtnActive]}
                onPress={() => handleLanguageToggle('tr')}
              >
                <Text style={[styles.langBtnText, language === 'tr' && styles.langBtnTextActive]}>
                  🇹🇷 {t.profile.turkish}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                onPress={() => handleLanguageToggle('en')}
              >
                <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                  🇬🇧 {t.profile.english}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.card}>
            <Text style={styles.label}>{t.profile.stats}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.totalGames}</Text>
                <Text style={styles.statName}>{t.profile.totalGames}</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxWin]}>
                <Text style={[styles.statValue, styles.statValueWin]}>{stats.wins}</Text>
                <Text style={styles.statName}>{t.profile.wins}</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxLoss]}>
                <Text style={[styles.statValue, styles.statValueLoss]}>{stats.losses}</Text>
                <Text style={styles.statName}>{t.profile.losses}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.draws}</Text>
                <Text style={styles.statName}>{t.profile.draws}</Text>
              </View>
            </View>

            {/* Best score */}
            <View style={styles.bestScore}>
              <Text style={styles.bestScoreLabel}>{t.profile.bestScore}</Text>
              {stats.bestWinGuessCount !== null ? (
                <Text style={styles.bestScoreValue}>
                  {stats.bestWinGuessCount} {t.profile.bestScoreUnit}
                </Text>
              ) : (
                <Text style={styles.bestScoreEmpty}>{t.profile.noWinsYet}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textBright,
    letterSpacing: ms(1),
  },
  closeBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  closeBtnText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: ms(1),
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: ms(12),
    fontSize: FontSize.lg,
    color: Colors.textBright,
    fontWeight: '700',
    letterSpacing: ms(1),
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: ms(14),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textBright,
    letterSpacing: ms(2),
  },
  btnDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  langRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  langBtn: {
    flex: 1,
    paddingVertical: ms(12),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  langBtnActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryLight,
  },
  langBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langBtnTextActive: {
    color: Colors.textBright,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: ms(2),
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statBoxWin: {
    borderColor: Colors.primaryLight,
  },
  statBoxLoss: {
    borderColor: Colors.secondary,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textBright,
  },
  statValueWin: {
    color: Colors.textGreen,
  },
  statValueLoss: {
    color: Colors.secondary,
  },
  statName: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  bestScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  bestScoreLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bestScoreValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.bull,
  },
  bestScoreEmpty: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
