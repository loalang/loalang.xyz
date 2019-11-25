import "styled-components/macro";
import React, { useState, useRef } from "react";
import useMediaQuery from "./useMediaQuery";
import { Search as SearchIcon } from "./Icons/Icon";
import ModalDropdown from "./ModalDropdown";

export default function Search() {
  const isInline = useMediaQuery("(min-width: 600px)");
  const [term, setTerm] = useState("");

  if (isInline) {
    return <SearchInput value={term} onChange={setTerm} />;
  }

  return <SearchDropdown value={term} onChange={setTerm} />;
}

function SearchDropdown({
  value,
  onChange
}: {
  value: string;
  onChange: (term: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <ModalDropdown
        toggleButtonRef={buttonRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        top="calc(env(safe-area-inset-top) + 50px)"
        alignment="right"
      >
        <SearchInput value={value} onChange={onChange} />
      </ModalDropdown>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        css={`
          padding: 3px;
          cursor: pointer;
          opacity: 0.8;
          transition: 200ms opacity;

          &:focus {
            outline: 0;
            opacity: 1;
          }
        `}
      >
        <SearchIcon size={24} />
      </button>
    </>
  );
}

function SearchInput({
  value,
  onChange
}: {
  value: string;
  onChange: (term: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      css={`
        background: rgba(255, 255, 255, 0.5);
        color: hsl(234, 67%, 39%);
        padding: 4px 6px;
        border-radius: 4px;

        &:focus {
          outline: 0;
          background: #fff;
          color: #000;
        }
      `}
    />
  );
}
