import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { css } from "emotion";

export function EditableText({
  children: value,
  placeholder,
  onChange
}: {
  children: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current != null) {
      inputRef.current.select();
    }
  }, [isEditing]);

  useLayoutEffect(() => {
    if (measureRef.current != null && isEditing) {
      const { width } = measureRef.current.getBoundingClientRect();
      if (inputRef.current != null) {
        inputRef.current.style.width = `${width}px`;
      }
    }
  }, [value, isEditing]);

  return (
    <span
      aria-label={value}
      className={css`
        display: inline-flex;
        align-items: center;
        height: 1em;

        &:focus-within,
        &:hover {
          outline: 2px solid rgba(0, 0, 214, 0.2);
          outline-offset: 2px;
        }
      `}
    >
      <div
        className={css`
          display: inline;
          min-width: 20px;
          position: absolute;
          top: -100000000px;
          white-space: pre-wrap;
        `}
        ref={measureRef}
      >
        {value || placeholder}
      </div>

      {!isEditing ? (
        <button
          className={css`
            text-align: left;
            display: inline-block;
            cursor: text;
            outline: 0;
          `}
          onClick={e => {
            setIsEditing(true);
          }}
        >
          {value || (
            <span
              className={css`
                color: rgba(0, 0, 214, 0.5);
              `}
            >
              {placeholder}
            </span>
          )}
        </button>
      ) : (
        <>
          <span
            aria-hidden
            className={css`
              position: absolute;
              display: ${value ? "none" : "block"};
              color: rgba(0, 0, 214, 0.5);
              pointer-events: none;
            `}
          >
            {placeholder}
          </span>
          <input
            aria-placeholder={placeholder}
            className={css`
              outline: 0;
            `}
            ref={inputRef}
            onBlur={() => {
              setIsEditing(false);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </>
      )}
    </span>
  );
}
