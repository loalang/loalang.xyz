import "styled-components/macro";
import React, { ReactNode, useContext } from "react";
import SafeArea from "./SafeArea";
import Menu from "./Menu";
import { TopNavigationContext } from "./TopNavigation";
import Helmet from "react-helmet";
import useMediaQuery from "./useMediaQuery";

const HEIGHT = 45;
const Z_INDEX = 10;

export function PageTitle({ children: name }: { children: string }) {
  const isInline = useMediaQuery("(min-width: 500px)");

  return (
    <>
      <Helmet>
        <title>{name} | Loa Programming Language</title>
      </Helmet>

      {isInline ? (
        <h1
          css={`
            font-weight: bold;
            font-size: 24px;
            line-height: 1.1;
          `}
        >
          {name}
        </h1>
      ) : (
        <div
          css={`
            position: fixed;
            top: 0;
            left: 50px;
            width: calc(100% - 100px);
            height: ${HEIGHT}px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #fff;
            z-index: ${Z_INDEX + 1};
          `}
        >
          <SafeArea top left right>
            <h1
              css={`
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                line-height: 1.3;
              `}
            >
              {name}
            </h1>
          </SafeArea>
        </div>
      )}
    </>
  );
}

export default function Header() {
  const topNavigation = useContext(TopNavigationContext);
  if (topNavigation == null) {
    throw new Error("The header is only valid within a TopNavigationContext");
  }
  return (
    <>
      <ContentWrapper />

      <header
        css={`
          background: #1111ff;
          color: #fff;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: ${Z_INDEX};
        `}
      >
        <ContentWrapper>
          <div
            css={`
              padding: 7px 10px;
              height: 100%;
              box-sizing: border-box;
            `}
          >
            <Menu items={topNavigation.menuItems} />
          </div>
        </ContentWrapper>
      </header>
    </>
  );
}

function ContentWrapper({ children }: { children?: ReactNode }) {
  return (
    <SafeArea top left right>
      <div
        css={`
          height: ${HEIGHT}px;
        `}
      >
        {children}
      </div>
    </SafeArea>
  );
}
