import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import { useGameStore } from '../store/game-store';

export function useSocket() {
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      useGameStore.getState().setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      useGameStore.getState().setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.log('Socket connect error:', err.message);
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
