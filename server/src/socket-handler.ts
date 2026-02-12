import { Server, Socket } from 'socket.io';
import { C2S } from '@bull-cow/shared';
import { GameManager } from './game-manager';
import { Matchmaker } from './matchmaker';

export function createSocketHandler(io: Server, gameManager: GameManager, matchmaker: Matchmaker) {
  return function handleConnection(socket: Socket): void {
    console.log(`Player connected: ${socket.id}`);

    socket.on(C2S.QUEUE_JOIN, () => {
      matchmaker.joinQueue(io, socket);
    });

    socket.on(C2S.QUEUE_LEAVE, () => {
      matchmaker.leaveQueue(socket.id);
    });

    socket.on(C2S.ROOM_CREATE, () => {
      matchmaker.createRoom(io, socket);
    });

    socket.on(C2S.ROOM_JOIN, (data: { roomCode: string }) => {
      matchmaker.joinRoom(io, socket, data.roomCode);
    });

    socket.on(C2S.SECRET_SUBMIT, (data: { secret: string }) => {
      gameManager.submitSecret(io, socket.id, data.secret);
    });

    socket.on(C2S.GUESS_SUBMIT, (data: { guess: string }) => {
      gameManager.submitGuess(io, socket.id, data.guess);
    });

    socket.on(C2S.REMATCH_REQUEST, () => {
      gameManager.requestRematch(io, socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      matchmaker.removeFromQueue(socket.id);
      gameManager.handleDisconnect(io, socket.id);
    });
  };
}
