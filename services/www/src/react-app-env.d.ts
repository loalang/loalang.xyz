/// <reference types="react-scripts" />

declare module "svgr.macro" {
  import { ReactElement } from "react";

  export interface SVGRProps {}

  export default function toReactComponent(
    path: string
  ): (props: SVGRProps) => ReactElement;
}
