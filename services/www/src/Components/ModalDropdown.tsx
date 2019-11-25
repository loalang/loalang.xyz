import "styled-components/macro";
import React, { ReactNode, useRef, useEffect, RefObject } from "react";
import usePortal from "../usePortal";
import { root } from "../dom";
import Dropdown from "./Dropdown";

export default function ModalDropdown({
  children,
  toggleButtonRef,
  isOpen,
  onClose,
  top,
  alignment
}: {
  children: ReactNode;
  toggleButtonRef?: RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
  alignment: "left" | "right";
  top: string | number;
}) {
  const createPortal = usePortal();
  const focusedRef = useRef<Element | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isOpen) {
        focusedRef.current = document.activeElement;
        root.setAttribute("inert", "inert");
        if (innerRef.current != null) {
          innerRef.current.focus();
        }
      } else if (
        focusedRef.current != null &&
        focusedRef.current instanceof HTMLElement
      ) {
        focusedRef.current.focus();
        root.removeAttribute("inert");
      }
    }, 1);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    function onFocus({ target }: MouseEvent | FocusEvent) {
      const focusTarget = target;

      if (toggleButtonRef != null && focusTarget === toggleButtonRef.current) {
        return;
      }

      if (
        !focusTarget ||
        (focusTarget &&
          !innerRef.current!.contains(focusTarget as Node) &&
          focusTarget !== innerRef.current)
      ) {
        onClose();
      }
    }

    root.addEventListener("click", onFocus);
    root.addEventListener("focusin", onFocus);
    return () => {
      root.removeEventListener("click", onFocus);
      root.removeEventListener("focusin", onFocus);
    };
  }, [onClose, toggleButtonRef]);

  return (
    <>
      {createPortal(
        <div
          css={`
            position: fixed;
            top: ${typeof top === "number" ? `${top}px` : top};
            ${alignment}: calc(env(${"safe-area-inset-" + alignment}) + 5px);

            &:focus {
              outline: 0;
            }
          `}
          tabIndex={-1}
          ref={innerRef}
        >
          <Dropdown isOpen={isOpen}>{children}</Dropdown>
        </div>
      )}
    </>
  );
}
