import React, { useState, useEffect, FormEvent, ReactNode } from "react";
import Helmet from "react-helmet";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Logo } from "@loalang/ui-toolbox/Icons/Logo";
import { Search } from "@loalang/ui-toolbox/Search/Search";
import { useMediaQuery } from "@loalang/ui-toolbox/useMediaQuery";
import { useOnClickOutside } from "@loalang/ui-toolbox/useOnClickOutside";
import { css } from "emotion";
import useSearch from "../Hooks/useSearch";
import { useLogin, useRegister, useUser } from "../Hooks/useAuth";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import { Link, useRouteMatch } from "react-router-dom";
import { EmailInput } from "@loalang/ui-toolbox/Forms/EmailInput";
import { PasswordInput } from "@loalang/ui-toolbox/Forms/PasswordInput";
import { Label } from "@loalang/ui-toolbox/Typography/TextStyle/Label";
import { Basic } from "@loalang/ui-toolbox/Typography/TextStyle/Basic";
import { Button } from "@loalang/ui-toolbox/Forms/Button";

const NAV_ITEMS = [
  {
    name: "Docs",
    path: "/docs",
    icon: Icon.FileText
  },
  {
    name: "Learn",
    path: "/learn",
    icon: Icon.Edit
  },
  {
    name: "Notebooks",
    path: "/notebooks",
    icon: Icon.Code
  }
];

export function Header({ children }: { children?: string }) {
  const isWide = useMediaQuery("(min-width: 680px)");
  const isInstalled = Boolean((navigator as any).standalone);

  return (
    <header
      className={css`
        position: sticky;
        top: 0px;
      `}
    >
      <Helmet>
        <title>
          {children != null
            ? `${children} | Loa Programming Language`
            : "Loa Programming Language"}
        </title>
      </Helmet>

      <div
        className={css`
          background: #1111ff;
          padding: ${isWide ? 10 : 9}px;
          position: relative;
        `}
      >
        <SafeArea top left right>
          <div
            className={css`
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin: 0 -6px;

              & > * {
                margin: 0 6px;
              }
            `}
          >
            <div
              className={css`
                display: flex;
                align-items: center;
                color: #fff;
                flex: 0 0 auto;
              `}
            >
              <Link to="/">
                <Logo size={isWide ? 36 : 27} />
              </Link>

              {isWide && (
                <>
                  <span
                    className={css`
                      margin-left: 6px;
                      font-size: 20px;
                      font-weight: bold;
                    `}
                  >
                    Loa
                  </span>

                  <DesktopMenu />
                </>
              )}
            </div>

            <div
              className={css`
                flex: 0 1 400px;
              `}
            >
              <GlobalSearch />
            </div>

            <div>
              <ProfileMenu />
            </div>
          </div>
        </SafeArea>
      </div>

      {!isWide && (isInstalled ? <NativeMobileMenu /> : <WebMobileMenu />)}
    </header>
  );
}

function NativeMobileMenu() {
  const { path: currentPath } = useRouteMatch();

  useEffect(() => {
    document.body.style.paddingBottom = "53px";
    return () => {
      document.body.style.paddingBottom = "0px";
    };
  }, []);

  return (
    <div
      className={css`
        background: #fff;
        box-shadow: 0px 75px 190px rgba(0, 0, 0, 0.2),
          0px -2px 7px rgba(0, 0, 0, 0.08);

        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
      `}
    >
      <SafeArea left right bottom>
        <div
          className={css`
            padding: 7px 9px;
            display: flex;
            justify-content: space-around;
          `}
        >
          {NAV_ITEMS.map(({ name, path, icon: Icon }) => (
            <Link key={name} to={path}>
              <div
                className={css`
                  display: inline-flex;
                  flex-direction: column;
                  align-items: center;
                  font-size: 26px;
                  color: ${currentPath !== "/" && path.startsWith(currentPath)
                    ? "#1111ff"
                    : "#000"};

                  & > span {
                    font-size: 13px;
                    font-weight: bold;
                  }
                `}
              >
                <Icon />
                <span>{name}</span>
              </div>
            </Link>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}

function DesktopMenu() {
  const { path: currentPath } = useRouteMatch();

  return (
    <div
      className={css`
        flex: 1 0 auto;
        margin: 0 0 -2px 15px;
      `}
    >
      {NAV_ITEMS.map(({ name, path, icon: Icon }) => (
        <Link key={name} to={path}>
          <div
            className={css`
              display: inline-flex;
              align-items: center;
              font-size: 21px;
              color: ${currentPath !== "/" && path.startsWith(currentPath)
                ? "#fff"
                : "rgba(255,255,255,0.5)"};

              & > span {
                margin-left: 3px;
                margin-right: 9px;
                font-size: 16px;
              }
            `}
          >
            <Icon />
            <span>{name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function WebMobileMenu() {
  const { path: currentPath } = useRouteMatch();

  return (
    <SafeArea left right>
      <div
        className={css`
          background: #fff;
          padding: 7px 9px;
          box-shadow: 0px -75px 190px rgba(0, 0, 0, 0.2),
            0px 2px 7px rgba(0, 0, 0, 0.08);

          white-space: nowrap;
          overflow-x: auto;
          -ms-overflow-style: none;
          &::-webkit-scrollbar {
            display: none;
          }
        `}
      >
        {NAV_ITEMS.map(({ name, path, icon: Icon }) => (
          <Link key={name} to={path}>
            <div
              className={css`
                display: inline-flex;
                align-items: center;
                font-size: 21px;
                color: ${currentPath !== "/" && path.startsWith(currentPath)
                  ? "#1111ff"
                  : "#000"};

                & > span {
                  margin-left: 3px;
                  margin-right: 9px;
                  font-size: 14px;
                  font-weight: bold;
                }
              `}
            >
              <Icon />
              <span>{name}</span>
            </div>
          </Link>
        ))}
      </div>
    </SafeArea>
  );
}

function GlobalSearch() {
  const [term, setTerm] = useState("");
  const { results } = useSearch(term);

  return (
    <Search
      term={term}
      onChange={setTerm}
      onClick={console.log.bind(console)}
      results={results.map(result => {
        switch (result.__typename) {
          case "ClassDoc": {
            const qualifiedName = `${result.name.namespace}/${result.name.name}`;
            return {
              id: qualifiedName,
              name: qualifiedName
            };
          }

          case "Package":
            return {
              id: result.packageName,
              name: result.packageName
            };

          default:
            throw new Error("Unknown search result!");
        }
      })}
      translucent
      placeholder="Search for anything..."
    />
  );
}

function ProfileMenu() {
  const isWide = useMediaQuery("(min-width: 680px)");
  const { isLoading, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [containerRef] = useOnClickOutside(() => setIsOpen(false));

  const size = isWide ? 34 : 25;

  return (
    <div
      ref={containerRef}
      className={css`
        position: relative;
      `}
    >
      <button
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={css`
          display: block;
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          background: #637bff;
          color: rgba(0, 0, 214, 0.5);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 1.1}px;
          overflow: hidden;
          border: 2px solid #fff;
          box-sizing: border-box;
          cursor: pointer;

          & > * {
            background: transparent;
          }
        `}
      >
        {isLoading ? null : user != null ? (
          user.email[0].toUpperCase()
        ) : (
          <div
            className={css`
              margin-top: -2px;
            `}
          >
            <Icon.Person filled />
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={css`
            position: absolute;
            right: 0;
            top: 120%;
            display: block;
            box-shadow: rgba(0, 0, 0, 0.063) 0px 10px 21px,
              rgba(0, 0, 0, 0.063) 0px 2px 4px;
            background: rgb(255, 255, 255);
            border-radius: 4px;
            overflow: hidden;
            background: #f9f9f9;
          `}
        >
          {user == null ? <LoginForm /> : <div>Logged in as {user.email}</div>}
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const [intent, setIntent] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [login, { isLoading: isLoggingIn, failed: failedLogin }] = useLogin();
  const [
    register,
    { isLoading: isRegistering, failed: failedRegistration }
  ] = useRegister();

  const isSubmitting = isLoggingIn || isRegistering;
  const failed = failedLogin || failedRegistration;

  const validationFailed =
    email === "" ||
    password === "" ||
    (intent === "register" && password !== passwordConfirmation);

  function submit(e?: FormEvent) {
    if (e != null) {
      e.preventDefault();
    }

    switch (intent) {
      case "login": {
        login(email, password);
        break;
      }

      case "register": {
        if (password === passwordConfirmation) {
          register(email, password);
        }
        break;
      }
    }
  }

  return (
    <form
      onSubmit={submit}
      className={css`
        width: 80vw;
        max-width: 350px;
        padding: 12px;
        display: grid;
        gap: 10px;
      `}
    >
      <div>
        <div
          className={css`
            margin-bottom: 5px;
          `}
        >
          <Label>Email</Label>
        </div>
        <EmailInput value={email} onChange={setEmail} />
      </div>
      <div>
        <div
          className={css`
            margin-bottom: 5px;
          `}
        >
          <Label>Password</Label>
        </div>
        <PasswordInput value={password} onChange={setPassword} />
      </div>
      {intent === "register" && (
        <div>
          <div
            className={css`
              margin-bottom: 5px;
            `}
          >
            <Label>Confirm Password</Label>
          </div>
          <PasswordInput
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
        </div>
      )}
      <div
        className={css`
          display: flex;
          align-items: center;
        `}
      >
        <p
          className={css`
            margin-right: 9px;
            flex: 1;
          `}
        >
          <Basic>
            {intent === "login" && (
              <>
                Don't have an account?{" "}
                <LinkButton onClick={() => setIntent("register")}>
                  Register
                </LinkButton>{" "}
                instead.
              </>
            )}

            {intent === "register" && (
              <>
                Already registered?{" "}
                <LinkButton onClick={() => setIntent("login")}>
                  Log in
                </LinkButton>{" "}
                instead.
              </>
            )}
          </Basic>
        </p>
        <Button
          primary
          isDisabled={isSubmitting || validationFailed}
          onClick={submit}
        >
          <Label>
            {intent === "login" && "Log In"}

            {intent === "register" && "Create Account"}
          </Label>
        </Button>
        <button
          className={css`
            display: none;
          `}
        />
      </div>
    </form>
  );
}

function LinkButton({
  onClick,
  children
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={css`
        cursor: pointer;
        text-decoration: underline;

        &:focus {
          outline: 0;
          color: #1111ff;
        }
      `}
      type="button"
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}
