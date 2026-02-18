import { io, Socket } from 'socket.io-client';
import * as Crypto from 'expo-crypto';

// @ts-ignore - __DEV__ is defined by React Native
const SERVER_URL = 'https://zihin-duellosu.onrender.com';

// Stable playerId per app session (survives reconnects, resets on app restart)
const playerId = Crypto.randomUUID();

let socket: Socket | null = null;

export function getPlayerId(): string {
  return playerId;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { playerId },
      extraHeaders: {
        'bypass-tunnel-reminder': 'true',
      },
    });
  }
  return socket;
}

export function connectSocket(): void {
  getSocket().connect();
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}
