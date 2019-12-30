import React from "react";
import { Title } from "../Components/Title";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { Body } from "@loalang/ui-toolbox/Typography/TextStyle/Body";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { css } from "emotion";

export function StorefrontView() {
  return (
    <>
      <Title />
      <Hero />
      <CodeExample />
    </>
  );
}

function Hero() {
  return (
    <div
      className={css`
        background: #ff0048;
        color: #fff;
      `}
    >
      <SafeArea left right>
        <div
          className={css`
            padding-bottom: 20vh;
            margin-bottom: -20vh;

            @media (min-height: 1000px) {
              padding-bottom: 200px;
              margin-bottom: -200px;
            }
          `}
        >
          <div
            className={css`
              text-align: center;
              padding: calc(40px + 3vh) 12px;
              padding-bottom: calc(20px + 3vh);
              max-width: 522px;
              margin: auto;
            `}
          >
            <Heading>
              <div
                className={css`
                  font-weight: 500;
                  font-size: 42px;
                  margin-bottom: calc(10px + 1vh);
                `}
              >
                Loa Programming Language
              </div>
            </Heading>

            <p
              className={css`
                color: #ffdae4;
              `}
            >
              <Body>
                Loa is a general-purpose, purely immutable, lazily evaluated,
                referentially transparent, object-oriented programming language.
              </Body>
            </p>
          </div>
        </div>
      </SafeArea>
    </div>
  );
}

function CodeExample() {
  return (
    <div
      className={css`
        background: transparent;
      `}
    >
      <SafeArea left right>
        <div
          className={css`
            padding: 0 12px;
            max-width: 500px;
            margin: auto;
          `}
        >
          <div
            className={css`
              box-shadow: 0px 2px 4px rgba(17, 17, 255, 0.2),
                0px 12px 26px rgba(17, 17, 255, 0.2);
              border-radius: 4px;
            `}
          >
            <Code language="loa">{`namespace MyApp/Financials.

import Finance/Money.

export class BankAccount {
  private var Money balance' = 0.

  public deposit: Money amount =>
    self balance': self balance' + amount.

  public withdraw: Money amount =>
    self balance': self balance' - amount.

  public balance => self balance'.
}`}</Code>
          </div>
        </div>
      </SafeArea>
    </div>
  );
}
