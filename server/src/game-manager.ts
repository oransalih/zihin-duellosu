import { Server } from 'socket.io';
import { GameRoom } from './game-room';

export class GameManager {
  private rooms = new Map<string, GameRoom>();
  private playerToRoom = new Map<string, string>();

  createRoom(creatorSocketId: string): GameRoom {
    const room = new GameRoom(creatorSocketId);
    this.rooms.set(room.id, room);
    this.playerToRoom.set(creatorSocketId, room.id);
    return room;
  }

  findRoomByCode(code: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.code === code) return room;
    }
    return undefined;
  }

  joinRoom(io: Server, roomId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const joined = room.addPlayer(io, socketId);
    if (joined) {
      this.playerToRoom.set(socketId, roomId);
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

  handleDisconnect(io: Server, playerId: string): void {
    const room = this.getRoomForPlayer(playerId);
    if (!room) return;
    room.handleDisconnect(io, playerId);
    this.playerToRoom.delete(playerId);

    // Cleanup room if both players disconnected
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
