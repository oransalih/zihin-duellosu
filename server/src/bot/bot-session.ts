import { Server } from 'socket.io';
import crypto from 'crypto';
import {
  BotProfile,
  BotDifficulty,
  BOT_PROFILES,
  OPENING_POOLS,
  selectBotDifficulty,
  selectBotName,
} from './bot-profiles';
import {
  generateAllCandidates,
  rebuildCandidates,
  generateBotSecret,
} from './candidate-filter';
import type { GameRoom } from '../game-room';
import type { GameManager } from '../game-manager';

const POLL_MS = 250;
/** Auto-cleanup if game_over persists beyond rematch window */
const GAME_OVER_CLEANUP_MS = 90_000;

export class BotSession {
  readonly botPlayerId: string;
  readonly botSocketId: string;
  readonly botName: string;
  readonly difficulty: BotDifficulty;

  private profile: BotProfile;
  private botSecret: string;
  private isFirstGuess = true;
  private secretSubmitted = false;
  private scheduledGuess = false;
  private rematchScheduled = false;
  private gameOverAt: number | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private io: Server,
    private gameManager: GameManager,
    private room: GameRoom,
  ) {
    this.botPlayerId = `bot_${crypto.randomUUID()}`;
    this.botSocketId = `bot_socket_${crypto.randomUUID()}`;
    this.difficulty = selectBotDifficulty();
    this.botName = selectBotName();
    this.profile = BOT_PROFILES[this.difficulty];
    this.botSecret = generateBotSecret();

    // Register the bot's virtual socket so GameManager tracking is consistent
    this.gameManager.registerSocket(this.botSocketId, this.botPlayerId);

    this.scheduleSecretSubmission();
    this.pollInterval = setInterval(() => this.tick(), POLL_MS);
  }

  private scheduleSecretSubmission(): void {
    const delay = 800 + Math.random() * 2000;
    setTimeout(() => {
      if (!this.secretSubmitted && this.room.state === 'waiting_for_secrets') {
        this.secretSubmitted = true;
        this.gameManager.submitSecret(this.io, this.botPlayerId, this.botSecret);
      }
    }, delay);
  }

  private tick(): void {
    const state = this.room.state;

    // ── Cleanup check ──
    if (state === 'game_over') {
      if (!this.gameOverAt) this.gameOverAt = Date.now();
      if (Date.now() - this.gameOverAt > GAME_OVER_CLEANUP_MS) {
        this.cleanup();
        return;
      }
      this.handleRematchCheck();
      return;
    }

    // Game is active again (rematch started)
    this.gameOverAt = null;
    this.rematchScheduled = false;

    // ── Bot is always player index 1 → plays on player_2_turn ──
    if (state === 'player_2_turn' && !this.scheduledGuess) {
      this.scheduledGuess = true;
      this.scheduleGuess();
    }
    if (state !== 'player_2_turn') {
      this.scheduledGuess = false;
    }
  }

  private handleRematchCheck(): void {
    if (this.rematchScheduled) return;

    const humanId = this.room.data.players[0]?.id;
    const rematchRequests = this.room.data.rematchRequests;

    if (humanId && rematchRequests.has(humanId) && !rematchRequests.has(this.botPlayerId)) {
      this.rematchScheduled = true;
      const delay = 1000 + Math.random() * 2000;
      setTimeout(() => this.botAcceptRematch(), delay);
    }
  }

  private botAcceptRematch(): void {
    // Reset for new round
    this.botSecret = generateBotSecret();
    this.isFirstGuess = true;
    this.scheduledGuess = false;
    this.secretSubmitted = false;

    // Accept — triggers resetForRematch when both have requested
    this.gameManager.requestRematch(this.io, this.botPlayerId);

    // Schedule new secret for the next round
    this.scheduleSecretSubmission();
  }

  private scheduleGuess(): void {
    const history = this.room.data.players[1]?.guesses ?? [];
    const candidates = this.isFirstGuess
      ? generateAllCandidates()
      : rebuildCandidates(history);

    const thinkTime = this.calcThinkTime(candidates.length);

    setTimeout(() => {
      if (this.room.state !== 'player_2_turn') return;
      const guess = this.pickGuess(candidates);
      this.gameManager.submitGuess(this.io, this.botPlayerId, guess);
    }, thinkTime);
  }

  private pickGuess(candidates: string[]): string {
    // First guess: fixed opening from pool
    if (this.isFirstGuess) {
      this.isFirstGuess = false;
      const pool = OPENING_POOLS[this.difficulty];
      return pool[Math.floor(Math.random() * pool.length)]!;
    }

    if (candidates.length === 0) return generateBotSecret();

    const r = Math.random();

    if (r < this.profile.blunderRate) {
      // Slight blunder: pick randomly (ignores candidate filter)
      return generateBotSecret();
    }

    if (r < this.profile.optimalPickRate) {
      // Best pick: first (most-constrained) candidate
      return candidates[0]!;
    }

    // Good pick: random from top-5 candidates
    const top = Math.min(5, candidates.length);
    return candidates[Math.floor(Math.random() * top)]!;
  }

  private calcThinkTime(candidateCount: number): number {
    const [min, max] = this.profile.thinkTimeRange;
    const base = min + Math.random() * (max - min);
    const jitter = (Math.random() - 0.5) * 800;
    const raw = Math.max(min, base + jitter);

    const speedFactor =
      candidateCount < this.profile.endgameThreshold
        ? this.profile.endgameSpeedup
        : 1.0;

    return Math.round(raw * speedFactor);
  }

  cleanup(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
