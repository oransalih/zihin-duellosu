import { Server, Socket } from 'socket.io';
import { C2S } from '@zihin-duellosu/shared';
import { GameManager } from './game-manager';
import { Matchmaker } from './matchmaker';

export function createSocketHandler(io: Server, gameManager: GameManager, matchmaker: Matchmaker) {
  return function handleConnection(socket: Socket): void {
    const playerId = socket.handshake.auth?.playerId as string;
    if (!playerId) {
      console.log(`Player rejected (no playerId): ${socket.id}`);
      socket.disconnect();
      return;
    }

    console.log(`Player connected: socket=${socket.id}, playerId=${playerId}`);

    // Try reconnection first
    const reconnected = gameManager.handleReconnect(io, playerId, socket.id);
    if (reconnected) {
      console.log(`Player reconnected to game: ${playerId}`);
    } else {
      // Register socket mapping for new connections
      gameManager.registerSocket(socket.id, playerId);
    }

    socket.on(C2S.QUEUE_JOIN, () => {
      matchmaker.joinQueue(io, socket, playerId);
    });

    socket.on(C2S.QUEUE_LEAVE, () => {
      matchmaker.leaveQueue(playerId);
    });

    socket.on(C2S.ROOM_CREATE, () => {
      matchmaker.createRoom(io, socket, playerId);
    });

    socket.on(C2S.ROOM_JOIN, (data: { roomCode: string }) => {
      matchmaker.joinRoom(io, socket, playerId, data.roomCode);
    });

    socket.on(C2S.SECRET_SUBMIT, (data: { secret: string }) => {
      gameManager.submitSecret(io, playerId, data.secret);
    });

    socket.on(C2S.GUESS_SUBMIT, (data: { guess: string }) => {
      gameManager.submitGuess(io, playerId, data.guess);
    });

    socket.on(C2S.REMATCH_REQUEST, () => {
      gameManager.requestRematch(io, playerId);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: socket=${socket.id}, playerId=${playerId}`);
      matchmaker.removeFromQueue(playerId);
      gameManager.handleDisconnect(io, socket.id);
    });
  };
}
