import "styled-components/macro";
import React, { useState, ReactNode } from "react";
import useLogin from "./useLogin";
import SubmitButton from "./SubmitButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { failed, isLoading }] = useLogin();

  return (
    <form
      css={`
        display: block;
        box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.1),
          0 14px 20px 0 rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        max-width: 400px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
      onSubmit={e => {
        e.preventDefault();
        login(email, password);
      }}
    >
      {failed && (
        <div>Wrong credentials! Check your password and try again.</div>
      )}

      <Label name="Email">
        <Field
          type="email"
          value={email}
          isDisabled={isLoading}
          onChange={setEmail}
        />
      </Label>

      <Label name="Password">
        <Field
          type="password"
          value={password}
          isDisabled={isLoading}
          onChange={setPassword}
        />
      </Label>

      <div
        css={`
          margin-top: 15px;
        `}
      >
        <SubmitButton>Log in</SubmitButton>
      </div>
    </form>
  );
}

function Label({ children, name }: { children: ReactNode; name: string }) {
  return (
    <label
      css={`
        width: 100%;
        margin-bottom: 10px;
      `}
    >
      <span
        css={`
          font-weight: bold;
          font-size: 13px;
          line-height: 1.5;
        `}
      >
        {name}
      </span>
      {children}
    </label>
  );
}

function Field({
  type,
  value,
  onChange,
  isDisabled
}: {
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  return (
    <input
      css={`
        border: 2px solid hsl(0, 0%, 80%);
        width: 100%;
        box-sizing: border-box;
        width: 100%;
        padding: 5px;
        border-radius: 3px;

        &:focus {
          border-color: #1111ff;
          outline: 0;
          box-shadow: 0 3px 5px -4px #1111ff;
        }
      `}
      type={type}
      value={value}
      disabled={isDisabled}
      onChange={e => onChange(e.target.value)}
    />
  );
}
