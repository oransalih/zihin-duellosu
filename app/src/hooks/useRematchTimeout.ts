import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/game-store';

const REMATCH_TIMEOUT_MS = 30_000;

/**
 * Starts a 30-second timeout once the local player has sent a rematch request.
 * If the opponent doesn't respond before the timeout, sets rematchTimedOut=true.
 * The timer is cleared if a MATCH_FOUND event fires (handled in useGameEvents).
 */
export function useRematchTimeout() {
  const rematchPending = useGameStore((s) => s.rematchPending);
  const rematchRequestedBy = useGameStore((s) => s.rematchRequestedBy);
  const rematchTimedOut = useGameStore((s) => s.rematchTimedOut);
  const setRematchTimedOut = useGameStore((s) => s.setRematchTimedOut);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only start the timeout when WE sent the request and are waiting
    if (rematchPending && rematchRequestedBy === 'you' && !rematchTimedOut) {
      timerRef.current = setTimeout(() => {
        setRematchTimedOut();
      }, REMATCH_TIMEOUT_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [rematchPending, rematchRequestedBy, rematchTimedOut, setRematchTimedOut]);
}
