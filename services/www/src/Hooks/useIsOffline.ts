import { useState, useEffect } from "react";

export function useIsOffline(): boolean {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const setOffline = setIsOffline.bind(null, true);
  const setOnline = setIsOffline.bind(null, false);

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  });

  return isOffline;
}
