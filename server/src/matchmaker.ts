import { Server, Socket } from 'socket.io';
import { S2C, ErrorCodes } from '@zihin-duellosu/shared';
import { GameManager } from './game-manager';

export class Matchmaker {
  private queue: { playerId: string; socketId: string; socket: Socket }[] = [];

  constructor(private gameManager: GameManager) {}

  joinQueue(io: Server, socket: Socket, playerId: string): void {
    // Already in queue?
    if (this.queue.some(q => q.playerId === playerId)) return;

    // Already in a game?
    if (this.gameManager.getRoomForPlayer(playerId)) return;

    if (this.queue.length > 0) {
      const opponent = this.queue.shift()!;
      // Create room and match
      const room = this.gameManager.createRoom(opponent.playerId, opponent.socketId);
      this.gameManager.joinRoom(io, room.id, playerId, socket.id);
      // match_found events are emitted by room.addPlayer
    } else {
      this.queue.push({ playerId, socketId: socket.id, socket });
      socket.emit(S2C.QUEUE_WAITING, { position: 1 });
    }
  }

  leaveQueue(playerId: string): void {
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
}
