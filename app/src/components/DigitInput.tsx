import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';

interface DigitInputProps {
  masked?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onComplete: (value: string) => void;
  onClear?: () => void;
}

export function DigitInput({ masked = false, disabled = false, compact = false, onComplete, onClear }: DigitInputProps) {
  const digitsRef = useRef(['', '', '', '']);
  const cursorRef = useRef<number | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [display, setDisplay] = useState(['', '', '', '']);

  const sync = () => setDisplay([...digitsRef.current]);

  const checkComplete = () => {
    if (digitsRef.current.every((d) => d !== '')) {
      onComplete(digitsRef.current.join(''));
    } else {
      onClear?.();
    }
  };

  const handleKeyPress = (e: any) => {
    const key = e.nativeEvent.key;

    if (/^\d$/.test(key)) {
      // Find target: cursor position or first empty
      const idx = cursorRef.current ?? digitsRef.current.findIndex((d) => d === '');
      cursorRef.current = null;
      if (idx < 0 || idx > 3) return;
      digitsRef.current[idx] = key;
      sync();
      checkComplete();
    } else if (key === 'Backspace') {
      // Clear last filled digit
      for (let i = 3; i >= 0; i--) {
        if (digitsRef.current[i]) {
          digitsRef.current[i] = '';
          sync();
          onClear?.();
          break;
        }
      }
    }
  };

  const handleBoxPress = (index: number) => {
    if (disabled) return;
    if (digitsRef.current[index]) {
      // Clear this digit, set cursor here for next typed digit
      digitsRef.current[index] = '';
      cursorRef.current = index;
      sync();
      onClear?.();
    }
    inputRef.current?.focus();
  };

  const cellStyle = compact ? styles.cellCompact : styles.cell;
  const textStyle = compact ? styles.digitTextCompact : styles.digitText;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {display.map((digit, i) => {
        const filled = digit !== '';
        return (
          <Pressable key={i} onPress={() => handleBoxPress(i)}>
            <View style={[cellStyle, filled && styles.cellFilled, disabled && styles.cellDisabled]}>
              <Text style={textStyle}>
                {filled ? (masked ? '\u2022' : digit) : ''}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        onKeyPress={handleKeyPress}
        keyboardType="number-pad"
        editable={!disabled}
        caretHidden
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  containerCompact: {
    gap: Spacing.sm,
  },
  cell: {
    width: ms(64),
    height: ms(76),
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCompact: {
    width: ms(48),
    height: ms(52),
    borderRadius: BorderRadius.sm,
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
  digitText: {
    color: Colors.textBright,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    textAlign: 'center',
  },
  digitTextCompact: {
    color: Colors.textBright,
    fontSize: FontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
