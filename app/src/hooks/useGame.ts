import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getSocket } from '../services/socket';
import { S2C, C2S } from '@bull-cow/shared';
import { useGameStore } from '../store/game-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

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

    socket.on(S2C.MATCH_FOUND, (data: { roomId: string }) => {
      useGameStore.getState().setRoomId(data.roomId);
      useGameStore.getState().setMatchmakingStatus('matched');
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
    });

    socket.on(S2C.OPPONENT_GUESSED, (data: { bulls: number; cows: number; round: number }) => {
      useGameStore.getState().addOpponentResult(data);
    });

    socket.on(S2C.TURN_CHANGE, (data: { yourTurn: boolean; round: number }) => {
      useGameStore.getState().setTurn(data.yourTurn, data.round);
    });

    socket.on(S2C.GAME_OVER, (data) => {
      useGameStore.getState().setGameOver(data);
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
        useGameStore.getState().setGameOver({
          winner: 'you',
          yourGuessCount: store().myGuesses.length,
          opponentGuessCount: store().opponentResults.length,
          opponentSecret: '????',
          reason: 'Rakip oyundan ayrildi',
        });
        navigation.navigate('Result', {
          result: store().result!,
        });
      }
    });

    socket.on(S2C.REMATCH_PENDING, (data: { requestedBy: 'you' | 'opponent' }) => {
      useGameStore.getState().setRematchPending(data.requestedBy);
    });

    socket.on(S2C.ERROR, (data: { code: string; message: string }) => {
      console.warn('Server error:', data.code, data.message);
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

export function useGameActions() {
  const submitSecret = useCallback((secret: string) => {
    getSocket().emit(C2S.SECRET_SUBMIT, { secret });
    useGameStore.getState().setMySecretSubmitted(true);
  }, []);

  const submitGuess = useCallback((guess: string) => {
    getSocket().emit(C2S.GUESS_SUBMIT, { guess });
  }, []);

  const requestRematch = useCallback(() => {
    getSocket().emit(C2S.REMATCH_REQUEST, {});
  }, []);

  return { submitSecret, submitGuess, requestRematch };
}
