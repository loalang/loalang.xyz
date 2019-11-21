import "styled-components/macro";
import React, { useRef, useEffect, useState } from "react";
import useMediaQuery from "./useMediaQuery";
import usePortal from "../usePortal";
import { root } from "../dom";
import { Link } from "@reach/router";
import { MenuItem } from "./MenuItem";
import MenuButton from "./MenuButton";
import Dropdown from "./Dropdown";
import Logo from "./Icons/Logo";

export interface MenuProps {
  items: MenuItem[];
}

export default function Menu(props: MenuProps) {
  const isInline = useMediaQuery("(min-width: 500px)");
  if (isInline) {
    return <InlineMenu {...props} />;
  } else {
    return <DropdownMenu {...props} />;
  }
}

function DropdownMenu({ items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createPortal = usePortal();
  const focusedRef = useRef<Element | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      focusedRef.current = document.activeElement;
      root.setAttribute("inert", "inert");
      const timeout = setTimeout(() => {
        if (activeLinkRef.current != null) {
          activeLinkRef.current.focus();
        }
      }, 1);
      return () => clearTimeout(timeout);
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
          css={`
            position: fixed;
            left: 5px;
            top: calc(env(safe-area-inset-top) + 45px + 2px);
          `}
          ref={menuRef}
          onBlur={({ relatedTarget }) => {
            if (
              !relatedTarget ||
              (relatedTarget &&
                !menuRef.current!.contains(relatedTarget as Node) &&
                menuButtonRef.current! !== relatedTarget)
            ) {
              setIsOpen(false);
            }
          }}
        >
          <Dropdown isOpen={isOpen}>
            <ul
              css={`
                padding: 5px 0;
              `}
            >
              {items.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <Link
                    css={`
                      display: inline-block;
                      padding: 3px 8px 3px 5px;
                    `}
                    to={path}
                    getProps={p => ({
                      ref:
                        p.isPartiallyCurrent || p.isCurrent
                          ? activeLinkRef
                          : undefined
                    })}
                  >
                    <Icon /> {name}
                  </Link>
                </li>
              ))}
            </ul>
          </Dropdown>
        </div>
      )}
      <div
        css={`
          display: flex;
          height: 100%;
          align-items: center;
        `}
      >
        <MenuButton
          ref={menuButtonRef}
          intent={isOpen ? "will-close" : "will-open"}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
    </>
  );
}

function InlineMenu({ items }: MenuProps) {
  return (
    <ul
      css={`
        display: flex;
        height: 100%;
        align-items: center;
      `}
    >
      <li>
        <Link
          css={`
            display: flex;
            align-items: center;
            margin-right: 30px;
          `}
          to="/"
        >
          <Logo />
          <em
            css={`
              font-weight: 600;
              margin: 5px;
            `}
          >
            Loa
          </em>
        </Link>
      </li>
      {items.map(({ name, path, icon: Icon }) => (
        <li key={path}>
          <Link
            to={path}
            css={`
              margin-right: 15px;
              transition: opacity 150ms;
            `}
            getProps={({ isCurrent }) => ({
              style: { opacity: isCurrent ? 1 : 0.6 }
            })}
          >
            <Icon /> {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
