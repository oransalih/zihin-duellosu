import { useEffect, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { getSocket } from '../services/socket';
import { S2C, C2S } from '@zihin-duellosu/shared';
import { useGameStore } from '../store/game-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { onGuessResult, onWin, onLose, onDraw } from '../services/feedback';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useGameEvents() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const socket = getSocket();
    const store = useGameStore.getState;

    socket.on(S2C.QUEUE_WAITING, () => {
      useGameStore.getState().setMatchmakingStatus('queuing');
    });

    socket.on(S2C.ROOM_CREATED, (data: { roomCode: string }) => {
      useGameStore.getState().setRoomCode(data.roomCode);
      useGameStore.getState().setMatchmakingStatus('waiting_for_opponent');
    });

    socket.on(S2C.MATCH_FOUND, (data: { roomId: string; opponentUsername?: string }) => {
      useGameStore.getState().setRoomId(data.roomId);
      useGameStore.getState().setMatchmakingStatus('matched');
      useGameStore.getState().setOpponentUsername(data.opponentUsername ?? null);
      useGameStore.getState().resetForRematch();
      navigation.navigate('Setup', { roomId: data.roomId });
    });

    socket.on(S2C.OPPONENT_READY, () => {
      useGameStore.getState().setOpponentReady(true);
    });

    socket.on(S2C.GAME_START, (data: { yourTurn: boolean; round: number }) => {
      useGameStore.getState().startGame(data.yourTurn, data.round);
      navigation.navigate('Game');
    });

    socket.on(S2C.GUESS_RESULT, (data: { guess: string; bulls: number; cows: number; round: number }) => {
      useGameStore.getState().addMyGuess(data);
      onGuessResult(data.bulls);
    });

    socket.on(S2C.OPPONENT_GUESSED, (data: { bulls: number; cows: number; round: number }) => {
      useGameStore.getState().addOpponentResult(data);
    });

    socket.on(S2C.TURN_CHANGE, (data: { yourTurn: boolean; round: number }) => {
      useGameStore.getState().setTurn(data.yourTurn, data.round);
    });

    socket.on(S2C.GAME_OVER, (data) => {
      useGameStore.getState().setGameOver(data);
      // Trigger feedback based on result
      if (data.winner === 'you') onWin();
      else if (data.winner === 'opponent') onLose();
      else onDraw();
      navigation.navigate('Result', { result: data });
    });

    socket.on(S2C.OPPONENT_RECONNECTING, (data: { timeoutSeconds: number }) => {
      useGameStore.getState().setOpponentReconnecting(true, data.timeoutSeconds);
    });

    socket.on(S2C.OPPONENT_RECONNECTED, () => {
      useGameStore.getState().setOpponentReconnecting(false);
    });

    socket.on(S2C.OPPONENT_DISCONNECTED, () => {
      const currentResult = store().result;
      if (!currentResult) {
        const gameOverResult = {
          winner: 'you' as const,
          yourGuessCount: store().myGuesses.length,
          opponentGuessCount: store().opponentResults.length,
          opponentSecret: '????',
          reason: 'opponent_disconnected',
        };
        useGameStore.getState().setGameOver(gameOverResult);
        onWin();
        navigation.navigate('Result', { result: gameOverResult });
      }
    });

    socket.on(S2C.REMATCH_PENDING, (data: { requestedBy: 'you' | 'opponent' }) => {
      useGameStore.getState().setRematchPending(data.requestedBy);
    });

    socket.on(S2C.ERROR, (data: { code: string; message: string }) => {
      useGameStore.getState().setMatchmakingStatus('idle');
      useGameStore.getState().setRoomCode(null);
      Alert.alert('Hata', data.message);
    });

    return () => {
      socket.off(S2C.QUEUE_WAITING);
      socket.off(S2C.ROOM_CREATED);
      socket.off(S2C.MATCH_FOUND);
      socket.off(S2C.OPPONENT_READY);
      socket.off(S2C.GAME_START);
      socket.off(S2C.GUESS_RESULT);
      socket.off(S2C.OPPONENT_GUESSED);
      socket.off(S2C.TURN_CHANGE);
      socket.off(S2C.GAME_OVER);
      socket.off(S2C.OPPONENT_RECONNECTING);
      socket.off(S2C.OPPONENT_RECONNECTED);
      socket.off(S2C.OPPONENT_DISCONNECTED);
      socket.off(S2C.REMATCH_PENDING);
      socket.off(S2C.ERROR);
    };
  }, [navigation]);
}

/**
 * Handles app background/foreground transitions.
 * When app returns from background, the socket reconnection is already
 * handled by socket.io's built-in reconnect logic. This hook just ensures
 * the store's connected state reflects reality.
 */
export function useAppStateHandler() {
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const socket = getSocket();
        // If socket is disconnected when returning from background, it will
        // reconnect automatically. We update connected state accordingly.
        if (!socket.connected) {
          useGameStore.getState().setConnected(false);
          socket.connect();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
}

export function useGameActions() {
  const submitSecret = useCallback((secret: string) => {
    getSocket().emit(C2S.SECRET_SUBMIT, { secret });
    useGameStore.getState().setMySecret(secret);
  }, []);

  const submitGuess = useCallback((guess: string) => {
    getSocket().emit(C2S.GUESS_SUBMIT, { guess });
  }, []);

  const requestRematch = useCallback(() => {
    // Guard: don't emit if already pending to prevent double-send
    const state = useGameStore.getState();
    if (state.rematchPending && state.rematchRequestedBy === 'you') return;
    getSocket().emit(C2S.REMATCH_REQUEST, {});
  }, []);

  return { submitSecret, submitGuess, requestRematch };
}
