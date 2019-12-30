import React from "react";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Title } from "../Components/Title";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { css } from "emotion";
import { Label } from "@loalang/ui-toolbox/Typography/TextStyle/Label";

export function NotFoundView() {
  return (
    <>
      <Title>Not Found</Title>
      <SafeArea left right bottom>
        <div
          className={css`
            margin-top: 20vh;
            text-align: center;
            padding: 9px;
          `}
        >
          <Heading>
            <div
              className={css`
                font-family: "IBM Plex Mono", monospace;
                font-size: 10vh;
              `}
            >
              404
            </div>
            <Label>Not Found</Label>
          </Heading>
        </div>
      </SafeArea>
    </>
  );
}
