import "styled-components/macro";
import React, {
  useState,
  useRef,
  ReactElement,
  ReactNode,
  forwardRef,
  Ref
} from "react";
import useMediaQuery from "./useMediaQuery";
import { Search as SearchIcon } from "./Icons/Icon";
import ModalDropdown from "./ModalDropdown";
import useSearch, { SearchResult } from "./useSearch";
import Dropdown from "./Dropdown";
import { Link } from "@reach/router";
import useDropdownMenuControl, {
  DropdownMenuControl
} from "./useDropdownMenuControl";

export default function Search() {
  const isInline = useMediaQuery("(min-width: 600px)");
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { results } = useSearch(term);
  const control = useDropdownMenuControl(term, results, inputRef, () => {
    setTerm("");
  });

  if (isInline) {
    return (
      <div
        css={`
          position: relative;
        `}
      >
        <SearchInput
          ref={inputRef}
          translucent
          value={term}
          onChange={setTerm}
        />
        <div
          css={`
            background: transparent;
            position: absolute;
            width: 100%;
          `}
        >
          <Dropdown crop isOpen={results.length > 0}>
            <SearchResults control={control} results={results} />
          </Dropdown>
        </div>
      </div>
    );
  }

  return (
    <SearchDropdown>
      <SearchInput ref={inputRef} value={term} onChange={setTerm} />
      <SearchResults control={control} results={results} />
    </SearchDropdown>
  );
}

function SearchResults({
  results,
  control
}: {
  results: SearchResult[];
  control: DropdownMenuControl<SearchResult>;
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <ul
      css={`
        color: #000;
      `}
    >
      {/* eslint-disable-next-line */}
      {results.map<ReactElement>(result => {
        const isSelected = control.selectedItem === result;

        switch (result.__typename) {
          case "Package":
            return (
              <Result
                ref={control.itemRef(result)}
                key={result.name}
                isSelected={isSelected}
                type="Package"
                link={`/docs/api/${result.name}`}
              >
                {result.name}
              </Result>
            );

          case "ClassDoc":
            return (
              <Result
                ref={control.itemRef(result)}
                key={result.qualifiedName}
                isSelected={isSelected}
                type="Class"
                link={`/docs/api/${result.qualifiedName}`}
              >
                <div>{result.simpleName}</div>
                <div
                  css={`
                    font-size: 9px;
                    margin-top: 4px;
                    opacity: 0.5;
                  `}
                >
                  in {result.qualifiedName.replace(/\/[^/]*?$/, "")}
                </div>
              </Result>
            );
        }
      })}
    </ul>
  );
}

const Result = forwardRef(function Result(
  {
    link,
    type,
    children,
    isSelected
  }: {
    link: string;
    type: string;
    children: ReactNode;
    isSelected: boolean;
  },
  ref: Ref<HTMLElement | null>
) {
  return (
    <Link getProps={() => ({ ref })} to={link}>
      <div
        css={`
          padding: 6px 6px 8px;
          background: ${isSelected ? "#1111ff" : "inherit"};
          color: ${isSelected ? "#fff" : "inherit"};
        `}
      >
        <em
          css={`
            display: block;
            font-size: 0.7em;
            text-transform: uppercase;
            letter-spacing: 0.01em;
            font-weight: bold;
            margin-bottom: 5px;
            opacity: 0.7;
          `}
        >
          {type}
        </em>
        {children}
      </div>
    </Link>
  );
});

function SearchDropdown({ children }: { children: ReactNode }) {
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
        {children}
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

const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    translucent = false
  }: {
    value: string;
    onChange: (term: string) => void;
    translucent?: boolean;
  },
  ref: Ref<HTMLInputElement>
) {
  return (
    <div
      css={`
        width: 80vw;

        @media (min-width: 500px) {
          width: 200px;
        }
      `}
    >
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        css={`
          appearance: none;
          background: ${translucent ? "rgba(255, 255, 255, 0.5)" : "#fff"};
          color: ${translucent ? "hsl(234, 67%, 39%)" : "#000"};
          padding: 4px 6px;
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;

          &::-webkit-search-decoration,
          &::-webkit-search-cancel-button,
          &::-webkit-search-results-button,
          &::-webkit-search-results-decoration {
            -webkit-appearance: none;
          }

          &:focus {
            outline: 0;
            background: #fff;
            color: #000;
          }
        `}
      />
    </div>
  );
});
