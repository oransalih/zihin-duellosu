export function evaluateGuess(secret: string, guess: string): { bulls: number; cows: number } {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }

  return { bulls, cows };
}

export function isWinningGuess(bulls: number): boolean {
  return bulls === 4;
}
