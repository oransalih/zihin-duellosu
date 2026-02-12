import { io, Socket } from 'socket.io-client';

// @ts-ignore - __DEV__ is defined by React Native
const SERVER_URL = 'https://sour-parts-go.loca.lt';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
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
