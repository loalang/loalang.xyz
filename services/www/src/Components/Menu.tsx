import "styled-components/macro";
import React, { useRef, useEffect, useState } from "react";
import useMediaQuery from "./useMediaQuery";
import usePortal from "../usePortal";
import { root } from "../dom";
import { Link } from "@reach/router";
import SafeArea from "./SafeArea";

export default function Menu() {
  const isInline = useMediaQuery("(min-width: 500px)");
  if (isInline) {
    return <InlineMenu />;
  } else {
    return <MenuButton />;
  }
}

function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const createPortal = usePortal();
  const focusedRef = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      focusedRef.current = document.activeElement;
      closeButtonRef.current!.focus();
    } else if (
      focusedRef.current != null &&
      focusedRef.current instanceof HTMLElement
    ) {
      focusedRef.current.focus();
      root.removeAttribute("inert");
    }
  }, [isOpen]);

  return (
    <>
      {createPortal(
        <div
          ref={menuRef}
          css={`
            display: ${isOpen ? "block" : "none"};
            position: fixed;
            left: 0;
            top: 0;

            height: 100vh;
            width: 100vh;
            background: white;
          `}
          onBlur={({ relatedTarget }) => {
            if (
              relatedTarget &&
              !menuRef.current!.contains(relatedTarget as Node)
            ) {
              setIsOpen(false);
            }
          }}
        >
          <SafeArea top left right bottom>
            <ul
              css={`
                padding: 7px 10px;
              `}
            >
              <li>
                <button ref={closeButtonRef} onClick={() => setIsOpen(false)}>
                  Close
                </button>
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </SafeArea>
        </div>
      )}
      <button onClick={() => setIsOpen(true)}>Menu</button>
    </>
  );
}

function InlineMenu() {
  return <div>Menu</div>;
}
