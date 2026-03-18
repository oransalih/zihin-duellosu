import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import { useGameStore } from '../store/game-store';
import { useProfileStore } from '../store/profile-store';
import { C2S } from '@zihin-duellosu/shared';

export function useSocket() {
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      useGameStore.getState().setConnected(true);
      // Re-send username to server on every (re)connect
      const username = useProfileStore.getState().profile.username;
      if (username) {
        socket.emit(C2S.SET_USERNAME, { username });
      }
    });

    socket.on('disconnect', (reason) => {
      useGameStore.getState().setConnected(false);
    });

    socket.on('connect_error', () => {
      // connect_error is informational — socket.io retries automatically
    });

    connectSocket();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      disconnectSocket();
    };
  }, []);
}
