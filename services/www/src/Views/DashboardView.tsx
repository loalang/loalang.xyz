import "styled-components/macro";
import React from "react";
import { PageTitle } from "../Components/Header";
import { useUser } from "../Components/useAuth";
import RegisterForm from "../Components/RegisterForm";
import LoginForm from "../Components/LoginForm";

export default function DashboardView() {
  const { isLoading, user } = useUser();

  return (
    <div
      css={`
        padding: 10px;
      `}
    >
      <PageTitle>Dashboard</PageTitle>
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: center;
        `}
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            You are{" "}
            {user == null ? "not logged in" : `logged in as ${user.email}`}
            {user == null && (
              <>
                <h1
                  css={`
                    font-size: 20px;
                    font-weight: bold;
                    margin: 40px 0 10px;
                  `}
                >
                  Register
                </h1>
                <RegisterForm />

                <h1
                  css={`
                    font-size: 20px;
                    font-weight: bold;
                    margin: 40px 0 10px;
                  `}
                >
                  Login
                </h1>
                <LoginForm />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}