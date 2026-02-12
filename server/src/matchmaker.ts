import { Server, Socket } from 'socket.io';
import { S2C, ErrorCodes } from '@bull-cow/shared';
import { GameManager } from './game-manager';

export class Matchmaker {
  private queue: { socketId: string; socket: Socket }[] = [];

  constructor(private gameManager: GameManager) {}

  joinQueue(io: Server, socket: Socket): void {
    // Already in queue?
    if (this.queue.some(q => q.socketId === socket.id)) return;

    // Already in a game?
    if (this.gameManager.getRoomForPlayer(socket.id)) return;

    if (this.queue.length > 0) {
      const opponent = this.queue.shift()!;
      // Create room and match
      const room = this.gameManager.createRoom(opponent.socketId);
      this.gameManager.joinRoom(io, room.id, socket.id);
      // match_found events are emitted by room.addPlayer
    } else {
      this.queue.push({ socketId: socket.id, socket });
      socket.emit(S2C.QUEUE_WAITING, { position: 1 });
    }
  }

  leaveQueue(socketId: string): void {
    this.queue = this.queue.filter(q => q.socketId !== socketId);
  }

  createRoom(io: Server, socket: Socket): void {
    const room = this.gameManager.createRoom(socket.id);
    socket.emit(S2C.ROOM_CREATED, { roomCode: room.code });
  }

  joinRoom(io: Server, socket: Socket, roomCode: string): void {
    const room = this.gameManager.findRoomByCode(roomCode.toUpperCase());
    if (!room) {
      socket.emit(S2C.ERROR, { code: ErrorCodes.ROOM_NOT_FOUND, message: 'Oda bulunamadi' });
      return;
    }

    if (room.data.players[1] !== null) {
      socket.emit(S2C.ERROR, { code: ErrorCodes.ROOM_FULL, message: 'Oda dolu' });
      return;
    }

    this.gameManager.joinRoom(io, room.id, socket.id);
  }

  removeFromQueue(socketId: string): void {
    this.leaveQueue(socketId);
  }
}
