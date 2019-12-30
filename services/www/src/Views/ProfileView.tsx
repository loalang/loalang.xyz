import React from "react";
import { Title } from "../Components/Title";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Body } from "@loalang/ui-toolbox/Typography/TextStyle/Body";
import { css } from "emotion";

export function ProfileView() {
  return (
    <>
      <Title>Profile</Title>
      <SafeArea left right bottom>
        <div
          className={css`
            padding: 9px;
          `}
        >
          <Heading>
            <PageHeading>Profile</PageHeading>
          </Heading>

          <p>
            <Body>TBD</Body>
          </p>
        </div>
      </SafeArea>
    </>
  );
}
