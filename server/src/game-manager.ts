import { Server } from 'socket.io';
import { GameRoom } from './game-room';

const GRACE_PERIOD_MS = 15_000;

export class GameManager {
  private rooms = new Map<string, GameRoom>();
  private playerToRoom = new Map<string, string>();       // playerId → roomId
  private socketToPlayer = new Map<string, string>();     // socketId → playerId
  private disconnectTimers = new Map<string, NodeJS.Timeout>(); // playerId → timer

  registerSocket(socketId: string, playerId: string): void {
    this.socketToPlayer.set(socketId, playerId);
  }

  getPlayerIdForSocket(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  createRoom(playerId: string, socketId: string): GameRoom {
    const room = new GameRoom(playerId, socketId);
    this.rooms.set(room.id, room);
    this.playerToRoom.set(playerId, room.id);
    this.socketToPlayer.set(socketId, playerId);
    return room;
  }

  findRoomByCode(code: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.code === code) return room;
    }
    return undefined;
  }

  joinRoom(io: Server, roomId: string, playerId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const joined = room.addPlayer(io, playerId, socketId);
    if (joined) {
      this.playerToRoom.set(playerId, roomId);
      this.socketToPlayer.set(socketId, playerId);
    }
    return joined;
  }

  getRoomForPlayer(playerId: string): GameRoom | undefined {
    const roomId = this.playerToRoom.get(playerId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  submitSecret(io: Server, playerId: string, secret: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room) return;
    room.submitSecret(io, playerId, secret);
  }

  submitGuess(io: Server, playerId: string, guess: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room) return;
    room.submitGuess(io, playerId, guess);
  }

  requestRematch(io: Server, playerId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room) return;
    room.requestRematch(io, playerId);
  }

  handleDisconnect(io: Server, socketId: string): void {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return;
    this.socketToPlayer.delete(socketId);

    const room = this.getRoomForPlayer(playerId);
    if (!room) {
      this.playerToRoom.delete(playerId);
      return;
    }

    // Only use grace period during active game states
    const activeStates = ['waiting_for_secrets', 'player_1_turn', 'player_2_turn'];
    if (activeStates.includes(room.state)) {
      room.markPlayerDisconnected(playerId);
      room.notifyOpponentReconnecting(io, playerId, GRACE_PERIOD_MS / 1000);

      const timer = setTimeout(() => {
        this.disconnectTimers.delete(playerId);
        room.handleDisconnect(io, playerId);
        this.playerToRoom.delete(playerId);
        this.cleanupRoomIfEmpty(room);
      }, GRACE_PERIOD_MS);

      this.disconnectTimers.set(playerId, timer);
    } else {
      // Not in active game, immediate cleanup
      room.handleDisconnect(io, playerId);
      this.playerToRoom.delete(playerId);
      this.cleanupRoomIfEmpty(room);
    }
  }

  handleReconnect(io: Server, playerId: string, newSocketId: string): boolean {
    // Clear grace period timer if exists
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }

    const room = this.getRoomForPlayer(playerId);
    if (!room) return false;

    // Check if this player is actually disconnected
    const idx = room.getPlayerIndex(playerId);
    if (idx === -1) return false;
    if (!room.data.players[idx]!.disconnectedAt) return false;

    // Update mappings
    this.socketToPlayer.set(newSocketId, playerId);

    // Reconnect in room
    room.reconnectPlayer(io, playerId, newSocketId);
    return true;
  }

  private cleanupRoomIfEmpty(room: GameRoom): void {
    const p0 = room.data.players[0];
    const p1 = room.data.players[1];
    const p0Connected = p0 ? this.playerToRoom.has(p0.id) : false;
    const p1Connected = p1 ? this.playerToRoom.has(p1.id) : false;

    if (!p0Connected && !p1Connected) {
      this.rooms.delete(room.id);
    }
  }

  // Periodic cleanup of stale rooms
  cleanup(): void {
    const now = Date.now();
    for (const [id, room] of this.rooms) {
      const age = now - room.data.createdAt;
      if (room.state === 'waiting_for_players' && age > 5 * 60 * 1000) {
        this.rooms.delete(id);
      } else if (room.state === 'game_over' && age > 2 * 60 * 1000) {
        // Remove player mappings
        for (const p of room.data.players) {
          if (p) this.playerToRoom.delete(p.id);
        }
        this.rooms.delete(id);
      }
    }
  }
}
