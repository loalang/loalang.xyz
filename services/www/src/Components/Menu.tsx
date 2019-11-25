import "styled-components/macro";
import React, { useRef, useState } from "react";
import useMediaQuery from "./useMediaQuery";
import { Link } from "@reach/router";
import { MenuItem } from "./MenuItem";
import MenuButton from "./MenuButton";
import Logo from "./Icons/Logo";
import ModalDropdown from "./ModalDropdown";

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <ModalDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        top="calc(env(safe-area-inset-top) + 50px)"
        alignment="left"
        toggleButtonRef={buttonRef}
      >
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
              >
                <Icon /> {name}
              </Link>
            </li>
          ))}
        </ul>
      </ModalDropdown>
      <div
        css={`
          display: flex;
          height: 100%;
          align-items: center;
        `}
      >
        <MenuButton
          ref={buttonRef}
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
