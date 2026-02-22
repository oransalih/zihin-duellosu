import { create } from 'zustand';
import { GuessResult, OpponentGuessResult, GameOverResult } from '@zihin-duellosu/shared';

type MatchmakingStatus = 'idle' | 'queuing' | 'creating_room' | 'waiting_for_opponent' | 'matched';

interface GameStore {
  // Connection
  connected: boolean;

  // Matchmaking
  matchmakingStatus: MatchmakingStatus;
  roomCode: string | null;
  roomId: string | null;

  // Setup
  mySecret: string | null;
  mySecretSubmitted: boolean;
  opponentReady: boolean;

  // Gameplay
  isPlaying: boolean;
  isMyTurn: boolean;
  round: number;
  myGuesses: GuessResult[];
  opponentResults: OpponentGuessResult[];

  // Result
  result: GameOverResult | null;

  // Reconnection
  opponentReconnecting: boolean;
  reconnectCountdown: number | null;

  // Rematch
  rematchPending: boolean;
  rematchRequestedBy: 'you' | 'opponent' | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setMatchmakingStatus: (status: MatchmakingStatus) => void;
  setRoomCode: (code: string | null) => void;
  setRoomId: (id: string | null) => void;
  setMySecret: (secret: string) => void;
  setOpponentReady: (ready: boolean) => void;
  startGame: (yourTurn: boolean, round: number) => void;
  addMyGuess: (result: GuessResult) => void;
  addOpponentResult: (result: OpponentGuessResult) => void;
  setTurn: (yourTurn: boolean, round: number) => void;
  setGameOver: (result: GameOverResult) => void;
  setOpponentReconnecting: (reconnecting: boolean, timeout?: number) => void;
  setRematchPending: (requestedBy: 'you' | 'opponent') => void;
  reset: () => void;
  resetForRematch: () => void;
}

const initialState = {
  connected: false,
  matchmakingStatus: 'idle' as MatchmakingStatus,
  roomCode: null,
  roomId: null,
  mySecret: null as string | null,
  mySecretSubmitted: false,
  opponentReady: false,
  isPlaying: false,
  isMyTurn: false,
  round: 1,
  myGuesses: [] as GuessResult[],
  opponentResults: [] as OpponentGuessResult[],
  result: null,
  opponentReconnecting: false,
  reconnectCountdown: null,
  rematchPending: false,
  rematchRequestedBy: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setConnected: (connected) => set({ connected }),
  setMatchmakingStatus: (matchmakingStatus) => set({ matchmakingStatus }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setRoomId: (roomId) => set({ roomId }),
  setMySecret: (secret) => set({ mySecret: secret, mySecretSubmitted: true }),
  setOpponentReady: (opponentReady) => set({ opponentReady }),

  startGame: (yourTurn, round) =>
    set({
      isPlaying: true,
      isMyTurn: yourTurn,
      round,
      myGuesses: [],
      opponentResults: [],
      result: null,
    }),

  addMyGuess: (result) =>
    set((state) => {
      if (state.myGuesses.some((g) => g.round === result.round)) return state;
      return { myGuesses: [...state.myGuesses, result] };
    }),

  addOpponentResult: (result) =>
    set((state) => {
      if (state.opponentResults.some((g) => g.round === result.round)) return state;
      return { opponentResults: [...state.opponentResults, result] };
    }),

  setTurn: (yourTurn, round) =>
    set({ isMyTurn: yourTurn, round }),

  setGameOver: (result) =>
    set({ result, isPlaying: false }),

  setOpponentReconnecting: (reconnecting, timeout) =>
    set({ opponentReconnecting: reconnecting, reconnectCountdown: timeout ?? null }),

  setRematchPending: (requestedBy) =>
    set({ rematchPending: true, rematchRequestedBy: requestedBy }),

  reset: () => set(initialState),

  resetForRematch: () =>
    set({
      mySecret: null,
      mySecretSubmitted: false,
      opponentReady: false,
      isPlaying: false,
      isMyTurn: false,
      round: 1,
      myGuesses: [],
      opponentResults: [],
      result: null,
      rematchPending: false,
      rematchRequestedBy: null,
    }),
}));
