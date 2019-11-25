import "styled-components/macro";
import React, { forwardRef, Ref } from "react";

function MenuButton(
  {
    intent,
    onClick
  }: {
    intent: "will-close" | "will-open";
    onClick: () => void;
  },
  ref: Ref<HTMLButtonElement>
) {
  let label: string;
  switch (intent) {
    case "will-close":
      label = "Close Menu";
      break;
    case "will-open":
      label = "Open Menu";
      break;
  }

  const size = 25;

  return (
    <button
      ref={ref}
      type="button"
      css={`
        font-size: ${size * 1.1}px;
        height: 0.9em;
        width: 0.9em;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border-radius: 1em;
        opacity: 0.8;
        transition: 200ms opacity;

        &:focus {
          outline: 0;
          opacity: 1;
        }

        &::before,
        &::after {
          content: "";
          display: block;
          height: 0.1em;
          width: 1em;
          background: currentColor;
          position: absolute;
          left: -0.05em;
          top: calc(50% - 0.05em);
          transform-origin: 50% 50%;
          transition-duration: 300ms;
          transition-property: transform;
        }

        ${intent === "will-open"
          ? `
            &::before {
              transform: translateY(-0.15em) rotate(-12deg);
            }

            &::after {
              transform: translateY(0.15em) rotate(-12deg);
            }
          `
          : ""}

        ${intent === "will-close"
          ? `
            &::before {
              transform: rotate(45deg);
            }

            &::after {
              transform: rotate(-45deg);
            }
          `
          : ""}
      `}
      onClick={() => onClick()}
      aria-label={label!}
    />
  );
}

export default forwardRef(MenuButton);
