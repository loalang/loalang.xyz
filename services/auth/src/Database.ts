import { Pool } from "pg";
import User from "./User";
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

  async insertUser(user: User, password: Buffer): Promise<boolean> {
    try {
      await this._pool.query(
        `
        insert into users(id, email, password) values($1, $2, $3);
      `,
        [user.id, user.email, password]
      );
      return true;
    } catch (e) {
      if (
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        return false;
      } else {
        throw e;
      }
    }
  }

  async findUser(email: string, password: Buffer): Promise<User | null> {
    const rows = await this._pool.query<User>(
      `select id, email from users where email = $1 and password = $2`,
      [email, password]
    );
    if (rows.rowCount === 0) {
      return null;
    }
    return rows.rows[0];
  }

  async findUserById(id: string): Promise<User | null> {
    const rows = await this._pool.query<User>(
      `select id, email from users where id = $1`,
      [id]
    );
    if (rows.rowCount === 0) {
      return null;
    }
    return rows.rows[0];
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const rows = await this._pool.query<User>(
      `select id, email from users where email = $1`,
      [email]
    );
    if (rows.rowCount === 0) {
      return null;
    }
    return rows.rows[0];
  }
}
