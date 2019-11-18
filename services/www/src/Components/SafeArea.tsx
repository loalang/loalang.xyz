import React, { CSSProperties, ReactNode } from "react";

export interface Props {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  children?: ReactNode;
}

export default function SafeArea({
  top,
  right,
  bottom,
  left,
  children
}: Props) {
  const style: CSSProperties = {};

  if (top) {
    style.paddingTop = "env(safe-area-inset-top)";
  }

  if (right) {
    style.paddingRight = "env(safe-area-inset-right)";
  }

  if (bottom) {
    style.paddingBottom = "env(safe-area-inset-bottom)";
  }

  if (left) {
    style.paddingLeft = "env(safe-area-inset-left)";
  }

  return <div style={style}>{children}</div>;
}
