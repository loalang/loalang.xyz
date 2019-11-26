import "styled-components/macro";
import React, { ReactNode, useEffect, useRef, useState } from "react";

const DURATION = 200;

export default function Dropdown({
  children,
  isOpen = children != null,
  crop = false
}: {
  children?: ReactNode;
  isOpen?: boolean;
  crop?: boolean;
}) {
  const [isDisposed, setIsDisposed] = useState(!isOpen);

  const childrenCopyRef = useRef<ReactNode | null>(null);

  if (isOpen) {
    childrenCopyRef.current = children;
  }

  useEffect(() => {
    if (isOpen) {
      setIsDisposed(false);
    } else {
      const timeout = setTimeout(() => {
        setIsDisposed(true);
      }, DURATION);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      css={`
        opacity: ${isOpen ? 1 : 0};
        transform: translateY(${isOpen ? "0" : "-5px"})
          rotateX(${isOpen ? "0" : "50deg"}) rotateY(${isOpen ? "0" : "5deg"});
        transform-origin: 50% 0;
        transition-duration: ${DURATION}ms;
        transition-property: opacity, transform, box-shadow;
        background: white;
        box-shadow: ${isOpen
          ? `
            0 3px 5px 0 rgba(0,0,0,0.1),
            0 14px 20px 0 rgba(0,0,0,0.2)
        `
          : `
            0 10px 10px 0 rgba(0,0,0,0.2),
            0 24px 50px 0 rgba(0,0,0,0.4)
        `};
        border-radius: 4px;

        overflow: ${crop ? "hidden" : "visible"};

        > * {
          background: transparent;
        }
      `}
    >
      {!isDisposed && (children || childrenCopyRef.current)}
    </div>
  );
}
