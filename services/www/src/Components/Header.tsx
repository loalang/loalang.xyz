import "styled-components/macro";
import React, { ReactNode } from "react";
import SafeArea from "./SafeArea";
import Menu from "./Menu";

const height = 50;

export default function Header({ children }: { children: ReactNode }) {
  return (
    <div>
      <ContentWrapper />

      <header
        css={`
          background: #1111ff;
          color: #fff;
          position: fixed;
          top: 0;
          width: 100%;
        `}
      >
        <ContentWrapper>
          <div
            css={`
              padding: 7px 10px;
            `}
          >
            <Menu />
            {children}
          </div>
        </ContentWrapper>
      </header>
    </div>
  );
}

function ContentWrapper({ children }: { children?: ReactNode }) {
  return (
    <SafeArea top left right>
      <div
        css={`
          height: ${height}px;
        `}
      >
        {children}
      </div>
    </SafeArea>
  );
}
