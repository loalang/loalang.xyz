import { EffectCallback, useEffect, useCallback, useState } from "react";

export function useTimeout(ms: number, cb: EffectCallback) {
  useEffect(() => {
    let cleanup: (() => void) | void;
    const timeout = setTimeout(() => {
      cleanup = cb();
    }, ms);
    return () => {
      clearTimeout(timeout);
      if (cleanup) {
        cleanup();
      }
    };
  }, [ms, cb]);
}

export function useDebouncedMemo<T>(ms: number, factory: () => T): T {
  const [state, setState] = useState(factory);
  useTimeout(
    ms,
    useCallback(() => {
      setState(factory());
    }, [factory])
  );
  return state;
}
