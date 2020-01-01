import { EffectCallback, useEffect } from "react";

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
