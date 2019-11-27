import React from "react";
import { PageTitle } from "../Components/Header";
import useUser from "../Components/useUser";
import LoginForm from "../Components/LoginForm";

export default function DashboardView() {
  const { isLoading, user } = useUser();

  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          You are{" "}
          {user == null ? "not logged in" : `logged in as ${user.email}`}
          {user == null && <LoginForm />}
        </div>
      )}
    </>
  );
}
