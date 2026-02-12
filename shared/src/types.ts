// Shared types used by both client and server

export interface GuessResult {
  guess: string;
  bulls: number;
  cows: number;
  round: number;
}

export interface OpponentGuessResult {
  bulls: number;
  cows: number;
  round: number;
}

export type RoomState =
  | 'waiting_for_players'
  | 'waiting_for_secrets'
  | 'player_1_turn'
  | 'player_2_turn'
  | 'game_over';

export type GameWinner = 'you' | 'opponent' | 'draw';

export interface GameOverResult {
  winner: GameWinner;
  yourGuessCount: number;
  opponentGuessCount: number;
  opponentSecret: string;
  reason: string;
}
