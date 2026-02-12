import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface DigitInputProps {
  masked?: boolean;
  disabled?: boolean;
  onComplete: (value: string) => void;
  onClear?: () => void;
}

export function DigitInput({ masked = false, disabled = false, onComplete, onClear }: DigitInputProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;
    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);
    if (text && index < 3) refs[index + 1].current?.focus();
    if (newDigits.every((d) => d !== '')) {
      onComplete(newDigits.join(''));
    } else {
      onClear?.();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      refs[index - 1].current?.focus();
      onClear?.();
    }
  };

  return (
    <Pressable onPress={() => {
      const emptyIdx = digits.findIndex((d) => d === '');
      refs[emptyIdx >= 0 ? emptyIdx : 3].current?.focus();
    }}>
      <View style={styles.container}>
        {digits.map((digit, i) => (
          <View key={i} style={[styles.cell, digit ? styles.cellFilled : null, disabled ? styles.cellDisabled : null]}>
            <TextInput
              ref={refs[i]}
              style={styles.input}
              value={masked && digit ? '\u2022' : digit}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              selectTextOnFocus
              caretHidden
            />
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  cell: {
    width: 64,
    height: 76,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cellDisabled: {
    opacity: 0.4,
  },
  input: {
    width: '100%',
    height: '100%',
    color: Colors.textBright,
    fontSize: FontSize.xxl,
    textAlign: 'center',
    fontWeight: '900',
  },
});
