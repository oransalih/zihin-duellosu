// Socket.IO event names and payload types

import { GameOverResult } from './types';

// ── Client to Server ──

export const C2S = {
  QUEUE_JOIN: 'c2s:queue_join',
  QUEUE_LEAVE: 'c2s:queue_leave',
  ROOM_CREATE: 'c2s:room_create',
  ROOM_JOIN: 'c2s:room_join',
  SECRET_SUBMIT: 'c2s:secret_submit',
  GUESS_SUBMIT: 'c2s:guess_submit',
  REMATCH_REQUEST: 'c2s:rematch_request',
} as const;

export interface C2SPayloads {
  [C2S.QUEUE_JOIN]: {};
  [C2S.QUEUE_LEAVE]: {};
  [C2S.ROOM_CREATE]: {};
  [C2S.ROOM_JOIN]: { roomCode: string };
  [C2S.SECRET_SUBMIT]: { secret: string };
  [C2S.GUESS_SUBMIT]: { guess: string };
  [C2S.REMATCH_REQUEST]: {};
}

// ── Server to Client ──

export const S2C = {
  QUEUE_WAITING: 's2c:queue_waiting',
  ROOM_CREATED: 's2c:room_created',
  MATCH_FOUND: 's2c:match_found',
  OPPONENT_READY: 's2c:opponent_ready',
  GAME_START: 's2c:game_start',
  GUESS_RESULT: 's2c:guess_result',
  OPPONENT_GUESSED: 's2c:opponent_guessed',
  TURN_CHANGE: 's2c:turn_change',
  GAME_OVER: 's2c:game_over',
  OPPONENT_DISCONNECTED: 's2c:opponent_disconnected',
  REMATCH_PENDING: 's2c:rematch_pending',
  ERROR: 's2c:error',
} as const;

export interface S2CPayloads {
  [S2C.QUEUE_WAITING]: { position: number };
  [S2C.ROOM_CREATED]: { roomCode: string };
  [S2C.MATCH_FOUND]: { roomId: string; opponentId: string };
  [S2C.OPPONENT_READY]: {};
  [S2C.GAME_START]: { yourTurn: boolean; round: number };
  [S2C.GUESS_RESULT]: { guess: string; bulls: number; cows: number; round: number };
  [S2C.OPPONENT_GUESSED]: { bulls: number; cows: number; round: number };
  [S2C.TURN_CHANGE]: { yourTurn: boolean; round: number };
  [S2C.GAME_OVER]: GameOverResult;
  [S2C.OPPONENT_DISCONNECTED]: { reason: string };
  [S2C.REMATCH_PENDING]: { requestedBy: 'you' | 'opponent' };
  [S2C.ERROR]: { code: string; message: string };
}

// Error codes
export const ErrorCodes = {
  INVALID_SECRET: 'INVALID_SECRET',
  INVALID_GUESS: 'INVALID_GUESS',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  NO_ACTIVE_GAME: 'NO_ACTIVE_GAME',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
} as const;
