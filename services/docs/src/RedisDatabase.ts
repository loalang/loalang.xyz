/// <reference path="./async-redis.d.ts" />

import { Database, Doc, ClassDoc } from "./Database";
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

  async saveClass(qualifiedName: string, doc: ClassDoc) {
    await this._client.set(`docs::${qualifiedName}`, JSON.stringify(doc));
  }

  async describe(qualifiedName: string): Promise<Doc | null> {
    const doc = await this._client.get(`docs::${qualifiedName}`);
    if (doc == null) {
      return null;
    }
    return JSON.parse(doc);
  }
}
