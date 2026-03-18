import { Server, Socket } from 'socket.io';
import { S2C, ErrorCodes } from '@zihin-duellosu/shared';
import { GameManager } from './game-manager';
import { BotSession } from './bot/bot-session';

/** Seconds to wait for a real opponent before falling back to a system match. */
const BOT_FALLBACK_MS = 8_000;
/** Extra jitter added after fallback triggers (feels more natural than instant). */
const BOT_CONNECT_JITTER_MS = 1_500;

interface QueueEntry {
  playerId: string;
  socketId: string;
  socket: Socket;
}

export class Matchmaker {
  private queue: QueueEntry[] = [];
  private fallbackTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Track cancelled fallbacks (player left queue before jitter resolved). */
  private cancelledFallbacks = new Set<string>();
  /** Active bot sessions keyed by roomId — for cleanup. */
  private botSessions = new Map<string, BotSession>();

  constructor(private gameManager: GameManager) {}

  joinQueue(io: Server, socket: Socket, playerId: string): void {
    if (this.queue.some(q => q.playerId === playerId)) return;
    if (this.gameManager.getRoomForPlayer(playerId)) return;

    if (this.queue.length > 0) {
      // Real opponent available — match immediately
      const opponent = this.queue.shift()!;
      this.cancelFallbackTimer(opponent.playerId);
      const room = this.gameManager.createRoom(opponent.playerId, opponent.socketId);
      this.gameManager.joinRoom(io, room.id, playerId, socket.id);
    } else {
      this.queue.push({ playerId, socketId: socket.id, socket });
      socket.emit(S2C.QUEUE_WAITING, { position: 1 });

      const timer = setTimeout(
        () => this.triggerBotFallback(io, playerId),
        BOT_FALLBACK_MS,
      );
      this.fallbackTimers.set(playerId, timer);
    }
  }

  leaveQueue(playerId: string): void {
    this.cancelFallbackTimer(playerId);
    this.cancelledFallbacks.add(playerId);
    this.queue = this.queue.filter(q => q.playerId !== playerId);
  }

  createRoom(io: Server, socket: Socket, playerId: string): void {
    const room = this.gameManager.createRoom(playerId, socket.id);
    socket.emit(S2C.ROOM_CREATED, { roomCode: room.code });
  }

  joinRoom(io: Server, socket: Socket, playerId: string, roomCode: string): void {
    const room = this.gameManager.findRoomByCode(roomCode.toUpperCase());
    if (!room) {
      socket.emit(S2C.ERROR, { code: ErrorCodes.ROOM_NOT_FOUND, message: 'Oda bulunamadi' });
      return;
    }
    if (room.data.players[1] !== null) {
      socket.emit(S2C.ERROR, { code: ErrorCodes.ROOM_FULL, message: 'Oda dolu' });
      return;
    }
    this.gameManager.joinRoom(io, room.id, playerId, socket.id);
  }

  removeFromQueue(playerId: string): void {
    this.leaveQueue(playerId);
  }

  // ── Private ──

  private cancelFallbackTimer(playerId: string): void {
    const t = this.fallbackTimers.get(playerId);
    if (t) {
      clearTimeout(t);
      this.fallbackTimers.delete(playerId);
    }
  }

  private triggerBotFallback(io: Server, playerId: string): void {
    const entry = this.queue.find(e => e.playerId === playerId);
    if (!entry) return; // Already matched with a real player

    this.queue = this.queue.filter(e => e.playerId !== playerId);
    this.fallbackTimers.delete(playerId);

    // Small natural delay before match is "found"
    const jitter = 500 + Math.random() * BOT_CONNECT_JITTER_MS;
    setTimeout(() => {
      // Player may have cancelled while jitter was pending
      if (this.cancelledFallbacks.has(playerId)) {
        this.cancelledFallbacks.delete(playerId);
        return;
      }

      // Create room with human as player 0
      const room = this.gameManager.createRoom(playerId, entry.socketId);

      // Create and register bot
      const bot = new BotSession(io, this.gameManager, room);
      this.gameManager.setUsername(bot.botPlayerId, bot.botName);
      this.gameManager.joinRoom(io, room.id, bot.botPlayerId, bot.botSocketId);

      this.botSessions.set(room.id, bot);
    }, jitter);
  }

  /** Call when a room is cleaned up to stop the associated bot session. */
  cleanupBotSession(roomId: string): void {
    const session = this.botSessions.get(roomId);
    if (session) {
      session.cleanup();
      this.botSessions.delete(roomId);
    }
  }
}
