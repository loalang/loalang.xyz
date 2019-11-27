import "styled-components/macro";
import React, { ReactNode } from "react";

export default function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      css={`
        background: #1111ff;
        color: #fff;
        padding: 10px;
        font-size: 13px;
        font-weight: bold;
        border-radius: 4px;
        transition-duration: 200ms;
        transition-property: transform, box-shadow;
        cursor: pointer;

        &:focus,
        &:hover {
          outline: 0;
          box-shadow: 0 3px 5px -4px #1111ff;
          transform: translateY(-2px);
        }
      `}
      type="submit"
    >
      {children}
    </button>
  );
}
