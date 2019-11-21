import "styled-components/macro";
import toReactComponent, { SVGRProps } from "svgr.macro";
import React, { ReactElement } from "react";

export const ArrowDownwards = withProps(
  toReactComponent("./svg/arrow-downward-outline.svg")
);
export const Home = withProps(toReactComponent("./svg/home-outline.svg"));
export const Info = withProps(toReactComponent("./svg/info-outline.svg"));

export type Icon = (props: IconProps) => ReactElement;

export interface IconProps {
  fill?: string;
  size?: string | number;
}

function withProps(Component: (props: SVGRProps) => ReactElement): Icon {
  return ({ fill = "currentColor", size = "1em" }) => {
    const sizeString = typeof size === "number" ? `${size}px` : size;

    return (
      <div
        css={`
          display: inline-block;
          vertical-align: text-bottom;
          align-self: center;
          fill: ${fill};
          width: ${sizeString};
          height: ${sizeString};
        `}
      >
        <Component />
      </div>
    );
  };
}
