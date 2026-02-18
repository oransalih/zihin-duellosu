import { Server } from 'socket.io';
import crypto from 'crypto';
import {
  evaluateGuess,
  isWinningGuess,
  validateSecret,
  validateGuess,
  S2C,
  ErrorCodes,
  GuessResult,
} from '@bull-cow/shared';
import { GameRoomData, Player } from './types';

export class GameRoom {
  data: GameRoomData;

  constructor(playerId: string, socketId: string) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.data = {
      id: crypto.randomUUID(),
      code,
      state: 'waiting_for_players',
      players: [
        { id: playerId, socketId, secret: null, guesses: [], disconnectedAt: null },
        null,
      ],
      round: 1,
      currentTurn: 0,
      pendingWin: null,
      rematchRequests: new Set(),
      createdAt: Date.now(),
    };
  }

  get id() { return this.data.id; }
  get code() { return this.data.code; }
  get state() { return this.data.state; }

  private getSocketIdForPlayer(playerId: string): string | null {
    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return null;
    return this.data.players[idx]!.socketId;
  }

  getPlayerIndex(playerId: string): 0 | 1 | -1 {
    if (this.data.players[0]?.id === playerId) return 0;
    if (this.data.players[1]?.id === playerId) return 1;
    return -1;
  }

  getOpponentIndex(playerId: string): 0 | 1 | -1 {
    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return -1;
    return (idx === 0 ? 1 : 0) as 0 | 1;
  }

  addPlayer(io: Server, playerId: string, socketId: string): boolean {
    if (this.data.state !== 'waiting_for_players' || this.data.players[1] !== null) {
      return false;
    }
    this.data.players[1] = { id: playerId, socketId, secret: null, guesses: [], disconnectedAt: null };
    this.data.state = 'waiting_for_secrets';

    const p1 = this.data.players[0]!;
    const p2 = this.data.players[1]!;
    io.to(p1.socketId).emit(S2C.MATCH_FOUND, { roomId: this.id, opponentId: p2.id });
    io.to(p2.socketId).emit(S2C.MATCH_FOUND, { roomId: this.id, opponentId: p1.id });
    return true;
  }

  submitSecret(io: Server, playerId: string, secret: string): void {
    if (this.data.state !== 'waiting_for_secrets') {
      this.emitError(io, playerId, ErrorCodes.NO_ACTIVE_GAME, 'Oyun bu asamada degil');
      return;
    }

    const validation = validateSecret(secret);
    if (!validation.valid) {
      this.emitError(io, playerId, ErrorCodes.INVALID_SECRET, validation.error!);
      return;
    }

    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return;

    this.data.players[idx]!.secret = secret;

    const opIdx = this.getOpponentIndex(playerId);
    if (opIdx !== -1 && this.data.players[opIdx]) {
      io.to(this.data.players[opIdx]!.socketId).emit(S2C.OPPONENT_READY, {});
    }

    // Check if both players have submitted
    if (this.data.players[0]?.secret && this.data.players[1]?.secret) {
      this.data.state = 'player_1_turn';
      this.data.currentTurn = 0;
      this.data.round = 1;

      io.to(this.data.players[0].socketId).emit(S2C.GAME_START, { yourTurn: true, round: 1 });
      io.to(this.data.players[1].socketId).emit(S2C.GAME_START, { yourTurn: false, round: 1 });
    }
  }

  submitGuess(io: Server, playerId: string, guess: string): void {
    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return;

    // Check it's the right turn
    const expectedState = idx === 0 ? 'player_1_turn' : 'player_2_turn';
    if (this.data.state !== expectedState) {
      this.emitError(io, playerId, ErrorCodes.NOT_YOUR_TURN, 'Senin siran degil');
      return;
    }

    const validation = validateGuess(guess);
    if (!validation.valid) {
      this.emitError(io, playerId, ErrorCodes.INVALID_GUESS, validation.error!);
      return;
    }

    const opIdx = this.getOpponentIndex(playerId) as 0 | 1;
    const opponentSecret = this.data.players[opIdx]!.secret!;
    const { bulls, cows } = evaluateGuess(opponentSecret, guess);

    const result: GuessResult = { guess, bulls, cows, round: this.data.round };
    this.data.players[idx]!.guesses.push(result);

    // Send result to guesser
    io.to(this.data.players[idx]!.socketId).emit(S2C.GUESS_RESULT, {
      guess, bulls, cows, round: this.data.round,
    });

    // Send opponent notification (without the guess itself)
    io.to(this.data.players[opIdx]!.socketId).emit(S2C.OPPONENT_GUESSED, {
      bulls, cows, round: this.data.round,
    });

    if (isWinningGuess(bulls)) {
      this.handleWin(io, idx);
    } else {
      this.advanceTurn(io);
    }
  }

  private handleWin(io: Server, winnerIdx: 0 | 1): void {
    // Same-round rule: if P1 wins, P2 gets one more guess
    if (this.data.pendingWin === null && winnerIdx === 0) {
      this.data.pendingWin = 0;
      // Give P2 a chance
      this.data.state = 'player_2_turn';
      this.data.currentTurn = 1;
      io.to(this.data.players[0]!.socketId).emit(S2C.TURN_CHANGE, { yourTurn: false, round: this.data.round });
      io.to(this.data.players[1]!.socketId).emit(S2C.TURN_CHANGE, { yourTurn: true, round: this.data.round });
      return;
    }

    // If P2 also wins (same round) or direct P2 win
    if (this.data.pendingWin === 0 && winnerIdx === 1) {
      // Both found it - compare guess counts
      const p1Count = this.data.players[0]!.guesses.length;
      const p2Count = this.data.players[1]!.guesses.length;

      let winner: 'draw' | 0 | 1;
      if (p1Count === p2Count) {
        winner = 'draw';
      } else {
        winner = p1Count < p2Count ? 0 : 1;
      }

      this.endGame(io, winner);
    } else {
      // Clear win (P2 didn't find it in same-round chance, or no pending)
      this.endGame(io, winnerIdx);
    }
  }

  private advanceTurn(io: Server): void {
    // If there was a pending win for P1 and P2 didn't find it
    if (this.data.pendingWin === 0 && this.data.currentTurn === 1) {
      this.endGame(io, 0);
      return;
    }

    if (this.data.currentTurn === 0) {
      this.data.state = 'player_2_turn';
      this.data.currentTurn = 1;
    } else {
      this.data.state = 'player_1_turn';
      this.data.currentTurn = 0;
      this.data.round++;
    }

    io.to(this.data.players[0]!.socketId).emit(S2C.TURN_CHANGE, {
      yourTurn: this.data.currentTurn === 0, round: this.data.round,
    });
    io.to(this.data.players[1]!.socketId).emit(S2C.TURN_CHANGE, {
      yourTurn: this.data.currentTurn === 1, round: this.data.round,
    });
  }

  private endGame(io: Server, winner: 0 | 1 | 'draw'): void {
    this.data.state = 'game_over';

    const p1 = this.data.players[0]!;
    const p2 = this.data.players[1]!;
    const p1Count = p1.guesses.length;
    const p2Count = p2.guesses.length;

    let reason: string;
    if (winner === 'draw') {
      reason = 'Berabere! Iki oyuncu da ayni sayida hamlede buldu.';
    } else {
      reason = `${winner === 0 ? 'Oyuncu 1' : 'Oyuncu 2'} daha az hamlede buldu!`;
    }

    // Emit to P1
    io.to(p1.socketId).emit(S2C.GAME_OVER, {
      winner: winner === 'draw' ? 'draw' : (winner === 0 ? 'you' : 'opponent'),
      yourGuessCount: p1Count,
      opponentGuessCount: p2Count,
      opponentSecret: p2.secret!,
      reason,
    });

    // Emit to P2
    io.to(p2.socketId).emit(S2C.GAME_OVER, {
      winner: winner === 'draw' ? 'draw' : (winner === 1 ? 'you' : 'opponent'),
      yourGuessCount: p2Count,
      opponentGuessCount: p1Count,
      opponentSecret: p1.secret!,
      reason,
    });
  }

  requestRematch(io: Server, playerId: string): void {
    if (this.data.state !== 'game_over') return;

    this.data.rematchRequests.add(playerId);

    const opIdx = this.getOpponentIndex(playerId);
    if (opIdx !== -1 && this.data.players[opIdx]) {
      io.to(this.data.players[opIdx]!.socketId).emit(S2C.REMATCH_PENDING, { requestedBy: 'opponent' });
    }
    const socketId = this.getSocketIdForPlayer(playerId);
    if (socketId) {
      io.to(socketId).emit(S2C.REMATCH_PENDING, { requestedBy: 'you' });
    }

    // Check if both requested
    if (this.data.rematchRequests.size === 2) {
      this.resetForRematch(io);
    }
  }

  private resetForRematch(io: Server): void {
    this.data.state = 'waiting_for_secrets';
    this.data.round = 1;
    this.data.currentTurn = 0;
    this.data.pendingWin = null;
    this.data.rematchRequests.clear();
    this.data.players[0]!.secret = null;
    this.data.players[0]!.guesses = [];
    this.data.players[1]!.secret = null;
    this.data.players[1]!.guesses = [];

    // Notify both players to go to setup screen
    io.to(this.data.players[0]!.socketId).emit(S2C.MATCH_FOUND, {
      roomId: this.id, opponentId: this.data.players[1]!.id,
    });
    io.to(this.data.players[1]!.socketId).emit(S2C.MATCH_FOUND, {
      roomId: this.id, opponentId: this.data.players[0]!.id,
    });
  }

  // ── Reconnection Methods ──

  markPlayerDisconnected(playerId: string): void {
    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return;
    this.data.players[idx]!.disconnectedAt = Date.now();
  }

  notifyOpponentReconnecting(io: Server, playerId: string, timeoutSeconds: number): void {
    const opIdx = this.getOpponentIndex(playerId);
    if (opIdx !== -1 && this.data.players[opIdx]) {
      io.to(this.data.players[opIdx]!.socketId).emit(S2C.OPPONENT_RECONNECTING, { timeoutSeconds });
    }
  }

  reconnectPlayer(io: Server, playerId: string, newSocketId: string): void {
    const idx = this.getPlayerIndex(playerId);
    if (idx === -1) return;

    this.data.players[idx]!.socketId = newSocketId;
    this.data.players[idx]!.disconnectedAt = null;

    // Notify opponent that they're back
    const opIdx = this.getOpponentIndex(playerId);
    if (opIdx !== -1 && this.data.players[opIdx]) {
      io.to(this.data.players[opIdx]!.socketId).emit(S2C.OPPONENT_RECONNECTED, {});
    }

    // Replay game state to the reconnected player
    const player = this.data.players[idx]!;
    const opponent = this.data.players[idx === 0 ? 1 : 0]!;
    const isMyTurn = this.data.currentTurn === idx;

    // Re-emit GAME_START to put them back on GameScreen
    io.to(newSocketId).emit(S2C.GAME_START, {
      yourTurn: isMyTurn,
      round: this.data.round,
    });

    // Re-send all their guess results
    for (const g of player.guesses) {
      io.to(newSocketId).emit(S2C.GUESS_RESULT, g);
    }

    // Re-send all opponent results (without guesses)
    for (const g of opponent.guesses) {
      io.to(newSocketId).emit(S2C.OPPONENT_GUESSED, {
        bulls: g.bulls, cows: g.cows, round: g.round,
      });
    }
  }

  handleDisconnect(io: Server, playerId: string): void {
    const opIdx = this.getOpponentIndex(playerId);
    if (opIdx !== -1 && this.data.players[opIdx]) {
      io.to(this.data.players[opIdx]!.socketId).emit(S2C.OPPONENT_DISCONNECTED, {
        reason: 'Rakip oyundan ayrildi',
      });
    }
    this.data.state = 'game_over';
  }

  private emitError(io: Server, playerId: string, code: string, message: string): void {
    const socketId = this.getSocketIdForPlayer(playerId);
    if (socketId) {
      io.to(socketId).emit(S2C.ERROR, { code, message });
    }
  }
}
