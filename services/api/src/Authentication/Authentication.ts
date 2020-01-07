import { ICookies as Cookies } from "cookies";
import User, { GuestUser } from "../Resolvers/User";
import LoggedInUser from "./LoggedInUser";

const COOKIE_KEY = "LOA_AUTH";
const AUTH_HOST = process.env.AUTH_HOST || "";

const A_DAY = 1000 * 60 * 60 * 24;
const THIRTY_DAYS = A_DAY * 30;

export default class Authentication {
  private constructor(private readonly _cookies: Cookies) {}

  static create(cookies: Cookies) {
    return new Authentication(cookies);
  }

  async user(): Promise<User> {
    const token = this._cookies.get(COOKIE_KEY);
    if (token == null) {
      return new GuestUser();
    }

    const user = await this._getUser(token);
    if (user == null) {
      return new GuestUser();
    }

    return user;
  }

  async findUser({
    id,
    email
  }:
    | { id: string; email?: never }
    | { id?: never; email: string }): Promise<User | null> {
    const url = new URL(`${AUTH_HOST}/whois`);
    if (id != null) {
      url.searchParams.set("id", id);
    }
    if (email != null) {
      url.searchParams.set("email", email);
    }
    const response = await fetch(url.href);
    if (response.status !== 200) {
      return null;
    }
    const { user } = await response.json();
    return user;
  }

  async register(email: string, password: string): Promise<User | null> {
    const response = await fetch(`${AUTH_HOST}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    if (response.status !== 200) {
      return null;
    }
    const { token } = await response.json();
    this._cookies.set(COOKIE_KEY, token, { maxAge: THIRTY_DAYS });
    return this._getUser(token);
  }

  async login(email: string, password: string): Promise<User | null> {
    const response = await fetch(`${AUTH_HOST}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    if (response.status !== 200) {
      return null;
    }
    const { token } = await response.json();
    this._cookies.set(COOKIE_KEY, token, { maxAge: THIRTY_DAYS });
    return this._getUser(token);
  }

  async logout(): Promise<void> {
    this._cookies.set(COOKIE_KEY, "", { maxAge: -THIRTY_DAYS });
  }

  private async _getUser(token: string): Promise<LoggedInUser | null> {
    const whoisResponse = await fetch(`${AUTH_HOST}/whoami`, {
      headers: {
        "X-Token": token
      }
    });

    if (whoisResponse.status !== 200) {
      return null;
    }
    const {
      user: { id, email },
      secondsLeftUntilExpiry
    } = await whoisResponse.json();

    if (secondsLeftUntilExpiry < THIRTY_DAYS - A_DAY) {
      const refreshResponse = await fetch(`${AUTH_HOST}/refresh`, {
        headers: {
          "X-Token": token
        }
      });
      if (refreshResponse.status === 200) {
        const { token } = await refreshResponse.json();
        this._cookies.set(COOKIE_KEY, token, { maxAge: THIRTY_DAYS });
      }
    }

    return new LoggedInUser(id, email);
  }
}
