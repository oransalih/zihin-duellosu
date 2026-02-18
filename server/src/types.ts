import { GuessResult, RoomState } from '@bull-cow/shared';

export interface Player {
  id: string;
  socketId: string;
  secret: string | null;
  guesses: GuessResult[];
  disconnectedAt: number | null;
}

export interface GameRoomData {
  id: string;
  code: string;
  state: RoomState;
  players: [Player, Player | null];
  round: number;
  currentTurn: 0 | 1;
  pendingWin: 0 | 1 | null;
  rematchRequests: Set<string>;
  createdAt: number;
}
