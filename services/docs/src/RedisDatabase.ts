/// <reference path="./async-redis.d.ts" />

import { Database, Doc } from "./Database";
import { Client, createClient } from "async-redis";

export class RedisDatabase implements Database {
  private constructor(private readonly _client: Client) {}

  static create() {
    return new RedisDatabase(
      createClient({
        host: process.env.REDIS_HOST || "",
        port: Number(process.env.REDIS_PORT || ""),
        password: process.env.REDIS_PASS
      })
    );
  }

  async rootNamespaces(): Promise<string[]> {
    const keys = await this._client.keys("docs::*");

    return Array.from(
      new Set(
        keys.map(
          k =>
            k
              .slice("docs::".length)
              .split("/")
              .shift()!
        )
      )
    );
  }

  async save(qualifiedName: string, doc: Doc) {
    await this._client.set(`docs::${qualifiedName}`, JSON.stringify(doc));
  }
}
