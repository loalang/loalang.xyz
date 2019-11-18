import { useRef, useState, useEffect } from "react";

export default function useMediaQuery(query: string) {
  const queryRef = useRef<MediaQueryList | null>(null);
  if (queryRef.current == null) {
    queryRef.current = window.matchMedia(query);
  }
  const [matches, setMatches] = useState(queryRef.current!.matches);

  useEffect(() => {
    function onChange() {
      setMatches(queryRef.current!.matches);
    }
    queryRef.current!.addListener(onChange);
    return () => queryRef.current!.removeListener(onChange);
  }, []);

  return matches;
}
