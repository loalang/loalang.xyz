import { Pool } from "pg";
import User from "./User";

export default class Database {
  private constructor(private readonly _pool: Pool) {}

  static create() {
    return new Database(
      new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASS,
        database: "auth"
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
}
