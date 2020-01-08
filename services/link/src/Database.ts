import { Pool } from "pg";
import { readFileSync } from "fs";

export default class Database {
  private constructor(private readonly _pool: Pool) {}

  static create() {
    return new Database(
      new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER || "postgres",
        port: Number(process.env.POSTGRES_PORT || 5432),
        password: process.env.POSTGRES_PASS,
        database: "auth",
        ssl:
          process.env.POSTGRES_CA_CERT != null
            ? {
                ca: readFileSync(process.env.POSTGRES_CA_CERT)
              }
            : false
      })
    );
  }

  async checkHealth() {
    await this._pool.query("select 1");
  }
}
