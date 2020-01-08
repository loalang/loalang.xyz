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
        database: "link",
        ssl:
          process.env.POSTGRES_CA_CERT != null
            ? {
                ca: readFileSync(process.env.POSTGRES_CA_CERT)
              }
            : false
      })
    );
  }

  async saveLink(id: string, target: string): Promise<boolean> {
    try {
      await this._pool.query("insert into links(id, target) values($1, $2)", [
        id,
        target
      ]);
      return true;
    } catch (e) {
      if (
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        return false;
      }
      throw e;
    }
  }

  async findLink(id: string): Promise<string | null> {
    const result = await this._pool.query<{ target: string }>(
      "select target from links where id = $1 limit 1",
      [id]
    );
    if (result.rowCount !== 1) {
      return null;
    }
    return result.rows[0].target;
  }
}
