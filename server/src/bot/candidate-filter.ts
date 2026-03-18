import { evaluateGuess } from '@zihin-duellosu/shared';
import type { GuessResult } from '@zihin-duellosu/shared';

/**
 * Generate all valid 4-digit secrets (first digit 1-9, no repeated digits).
 * ~4536 candidates.
 */
export function generateAllCandidates(): string[] {
  const result: string[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      if (b === a) continue;
      for (let c = 0; c <= 9; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d <= 9; d++) {
          if (d === a || d === b || d === c) continue;
          result.push(`${a}${b}${c}${d}`);
        }
      }
    }
  }
  return result;
}

/**
 * Filter candidates: keep only those consistent with the given guess result.
 * A candidate c is kept if: evaluate(c, guess) === { bulls, cows }
 */
export function filterCandidates(
  candidates: string[],
  guess: string,
  bulls: number,
  cows: number,
): string[] {
  return candidates.filter((c) => {
    const r = evaluateGuess(c, guess);
    return r.bulls === bulls && r.cows === cows;
  });
}

/**
 * Rebuild the candidate pool from scratch using all historical guesses.
 * More reliable than incremental filtering.
 */
export function rebuildCandidates(history: GuessResult[]): string[] {
  let candidates = generateAllCandidates();
  for (const g of history) {
    candidates = filterCandidates(candidates, g.guess, g.bulls, g.cows);
  }
  return candidates;
}

/** Generate a random valid 4-digit secret (first digit 1-9, no repeats). */
export function generateBotSecret(): string {
  const pool = ['1','2','3','4','5','6','7','8','9'];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const first = pool[0]!;
  const remaining = ['0','1','2','3','4','5','6','7','8','9'].filter(d => d !== first);
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j]!, remaining[i]!];
  }
  return first + remaining[0] + remaining[1] + remaining[2];
}
