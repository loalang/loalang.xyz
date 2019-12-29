import React, { useState } from "react";
import Helmet from "react-helmet";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Logo } from "@loalang/ui-toolbox/Icons/Logo";
import { Search } from "@loalang/ui-toolbox/Search/Search";
import { ItemHeading } from "@loalang/ui-toolbox/Typography/TextStyle/ItemHeading";
import { useMediaQuery } from "@loalang/ui-toolbox/useMediaQuery";
import { css } from "emotion";
import useSearch from "../Hooks/useSearch";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import { Link, useRouteMatch } from "react-router-dom";

const NAV_ITEMS = [
  {
    name: "Docs",
    path: "/docs",
    icon: Icon.FileText
  },
  {
    name: "Profile",
    path: "/me",
    icon: Icon.Person
  },
  {
    name: "Learn",
    path: "/learn",
    icon: Icon.Edit
  },
  {
    name: "Notebooks",
    path: "/notebooks",
    icon: Icon.Code
  }
];

export function Header({ children }: { children?: string }) {
  const isWide = useMediaQuery("(min-width: 500px)");
  const { path: currentPath } = useRouteMatch();

  return (
    <header
      className={css`
        position: sticky;
        top: 0px;
      `}
    >
      <Helmet>
        <title>
          {children != null
            ? `${children} | Loa Programming Language`
            : "Loa Programming Language"}
        </title>
      </Helmet>

      <div
        className={css`
          background: #1111ff;
          padding: ${isWide ? 10 : 9}px;
          position: relative;
        `}
      >
        <SafeArea top left right>
          <div
            className={css`
              display: flex;
              align-items: center;
              margin: 0 -6px;

              & > * {
                margin: 0 6px;
              }
            `}
          >
            <div
              className={css`
                display: flex;
                align-items: center;
                color: #fff;
              `}
            >
              <Link to="/">
                <Logo size={isWide ? 36 : 27} />
              </Link>

              {isWide && (
                <span
                  className={css`
                    margin-left: 6px;
                  `}
                >
                  <ItemHeading>Loa</ItemHeading>
                </span>
              )}
            </div>

            <GlobalSearch />
          </div>
        </SafeArea>
      </div>

      <div
        className={css`
          background: #fff;
          padding: 7px ${isWide ? 10 : 9}px;
          box-shadow: 0px -75px 190px rgba(0, 0, 0, 0.2),
            0px 2px 7px rgba(0, 0, 0, 0.08);

          white-space: nowrap;
          overflow-x: auto;
          -ms-overflow-style: none;
          &::-webkit-scrollbar {
            display: none;
          }
        `}
      >
        <SafeArea left right>
          {NAV_ITEMS.map(({ name, path, icon: Icon }) => (
            <Link key={name} to={path}>
              <div
                className={css`
                  display: inline-flex;
                  align-items: center;
                  font-size: 21px;
                  color: ${currentPath !== "/" && path.startsWith(currentPath)
                    ? "#1111ff"
                    : "#000"};

                  & > span {
                    margin-left: 3px;
                    margin-right: 9px;
                    font-size: 14px;
                    font-weight: bold;
                  }
                `}
              >
                <Icon />
                <span>{name}</span>
              </div>
            </Link>
          ))}
        </SafeArea>
      </div>
    </header>
  );
}

function GlobalSearch() {
  const [term, setTerm] = useState("");
  const { results } = useSearch(term);

  return (
    <div
      className={css`
        flex: 0 1 400px;
      `}
    >
      <Search
        term={term}
        onChange={setTerm}
        onClick={console.log.bind(console)}
        results={results.map(result => {
          switch (result.__typename) {
            case "ClassDoc":
              return {
                id: result.qualifiedName,
                name: result.qualifiedName
              };

            case "Package":
              return {
                id: result.name,
                name: result.name
              };

            default:
              throw new Error("Unknown search result!");
          }
        })}
        translucent
        placeholder="Search for anything..."
      />
    </div>
  );
}
