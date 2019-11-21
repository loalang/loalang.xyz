import "styled-components/macro";
import toReactComponent, { SVGRProps } from "svgr.macro";
import React, { ReactElement } from "react";

const Logo = withProps(toReactComponent("./Logo.svg"));

export default Logo;

export interface LogoProps {
  size?: string | number;
}

function withProps(
  Component: (props: SVGRProps) => ReactElement
): (props: LogoProps) => ReactElement {
  return ({ size = "1.7em" }) => {
    const sizeString = typeof size === "number" ? `${size}px` : size;

    return (
      <div
        css={`
          display: inline-block;
          vertical-align: text-bottom;
          align-self: center;
          width: ${sizeString};
          height: ${sizeString};

          svg {
            width: 100%;
          }
        `}
      >
        <Component />
      </div>
    );
  };
}
