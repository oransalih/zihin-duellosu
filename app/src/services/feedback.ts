/**
 * FeedbackService — centralised audio + haptic triggers.
 *
 * Audio files expected in app/assets/sounds/:
 *   guess.mp3     — played when your guess result arrives (any bulls/cows)
 *   bull.mp3      — played when you get 1-3 bulls (good progress)
 *   win.mp3       — played on winning the game
 *   lose.mp3      — played on losing the game
 *
 * If files are absent or expo-av is unavailable, audio is silently skipped.
 * Haptics degrade gracefully on devices/simulators that don't support them.
 */

import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

type SoundKey = 'guess' | 'bull' | 'win' | 'lose';

// Map sound keys to asset requires. Add actual files to app/assets/sounds/
// and uncomment the corresponding lines below.
const soundAssets: Partial<Record<SoundKey, number>> = {
  // guess: require('../../assets/sounds/guess.mp3'),
  // bull:  require('../../assets/sounds/bull.mp3'),
  // win:   require('../../assets/sounds/win.mp3'),
  // lose:  require('../../assets/sounds/lose.mp3'),
};

let soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};

async function playSound(key: SoundKey): Promise<void> {
  const asset = soundAssets[key];
  if (!asset) return; // No file registered — skip silently

  try {
    if (!soundCache[key]) {
      const { sound } = await Audio.Sound.createAsync(asset);
      soundCache[key] = sound;
    }
    const sound = soundCache[key]!;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Graceful fallback — do not crash on audio failure
  }
}

export async function initAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false, // respect silent switch on iOS
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
  } catch {
    // Silent fallback
  }
}

export async function unloadAllSounds(): Promise<void> {
  for (const sound of Object.values(soundCache)) {
    try {
      await sound.unloadAsync();
    } catch {
      // Ignore
    }
  }
  soundCache = {};
}

// ── Public Trigger API ────────────────────────────────────────────────────────

/** Called when a guess result arrives (any result) */
export function onGuessResult(bulls: number): void {
  if (bulls >= 1 && bulls < 4) {
    // Positive progress — stronger feedback
    void playSound('bull');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  } else if (bulls === 0) {
    // No bulls — light tap
    void playSound('guess');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

/** Called when the player wins */
export function onWin(): void {
  void playSound('win');
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Called when the player loses */
export function onLose(): void {
  void playSound('lose');
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

/** Called on draw */
export function onDraw(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Subtle tap for UI interactions */
export function onTap(): void {
  void Haptics.selectionAsync().catch(() => {});
}
