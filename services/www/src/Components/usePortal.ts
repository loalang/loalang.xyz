import { useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export default function usePortal(): (node: ReactNode) => ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  if (containerRef.current == null) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    containerRef.current = container;
  }
  useEffect(
    () => () => {
      document.body.removeChild(containerRef.current!);
    },
    []
  );
  return node => createPortal(node, containerRef.current!);
}
