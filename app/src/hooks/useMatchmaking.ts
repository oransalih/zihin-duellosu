import { useCallback } from 'react';
import { getSocket } from '../services/socket';
import { C2S } from '@bull-cow/shared';
import { useGameStore } from '../store/game-store';

export function useMatchmaking() {
  const matchmakingStatus = useGameStore((s) => s.matchmakingStatus);
  const roomCode = useGameStore((s) => s.roomCode);

  const joinQueue = useCallback(() => {
    useGameStore.getState().setMatchmakingStatus('queuing');
    getSocket().emit(C2S.QUEUE_JOIN, {});
  }, []);

  const leaveQueue = useCallback(() => {
    useGameStore.getState().setMatchmakingStatus('idle');
    getSocket().emit(C2S.QUEUE_LEAVE, {});
  }, []);

  const createRoom = useCallback(() => {
    useGameStore.getState().setMatchmakingStatus('creating_room');
    getSocket().emit(C2S.ROOM_CREATE, {});
  }, []);

  const joinRoom = useCallback((code: string) => {
    useGameStore.getState().setMatchmakingStatus('queuing');
    getSocket().emit(C2S.ROOM_JOIN, { roomCode: code });
  }, []);

  return {
    matchmakingStatus,
    roomCode,
    joinQueue,
    leaveQueue,
    createRoom,
    joinRoom,
  };
}
