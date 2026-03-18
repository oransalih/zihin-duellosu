import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation } from '../i18n';
import { useProfileStore } from '../store/profile-store';
import { validateUsername } from '../services/profile-repository';

interface UsernameModalProps {
  visible: boolean;
  onSaved: () => void;
}

export function UsernameModal({ visible, onSaved }: UsernameModalProps) {
  const { t } = useTranslation();
  const setUsername = useProfileStore((s) => s.setUsername);
  const [value, setValue] = useState('');
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
    const result = validateUsername(value);
    if (!result.valid) {
      setError(getValidationMessage(result.error!));
      return;
    }
    setSaving(true);
    await setUsername(value.trim());
    setSaving(false);
    setValue('');
    setError(null);
    onSaved();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t.profile.usernamePromptTitle}</Text>
          <Text style={styles.subtitle}>{t.profile.usernamePromptSub}</Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={value}
            onChangeText={(v) => { setValue(v); setError(null); }}
            placeholder={t.profile.usernamePlaceholder}
            placeholderTextColor={Colors.textMuted}
            maxLength={16}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              (saving || !value.trim()) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSave}
            disabled={saving || !value.trim()}
          >
            <Text style={styles.btnText}>{t.profile.save}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textBright,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: ms(20),
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: ms(14),
    fontSize: FontSize.lg,
    color: Colors.textBright,
    fontWeight: '700',
    letterSpacing: ms(1),
    textAlign: 'center',
  },
  inputError: { borderColor: Colors.error },
  error: { fontSize: FontSize.sm, color: Colors.error, textAlign: 'center' },
  btn: {
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
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textBright, letterSpacing: ms(2) },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
