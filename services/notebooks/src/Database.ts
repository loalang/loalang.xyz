import { Pool } from "pg";
import { readFileSync } from "fs";
import { Notebook, NotebookPatch, NotebookBlock } from "./Notebook";
import { createDeflate } from "zlib";

export default class Database {
  private constructor(private readonly _pool: Pool) {}

  static create() {
    return new Database(
      new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER || "postgres",
        port: Number(process.env.POSTGRES_PORT || 5432),
        password: process.env.POSTGRES_PASS,
        database: "notebooks",
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

  async findNotebook(id: string): Promise<Notebook | null> {
    const result = await this._pool.query<{
      id: string;
      author: string;
      title: string;
      created_at: Date;
      updated_at: Date;
      blocks: NotebookBlock[];
    }>("select * from notebooks where id = $1 limit 1", [id]);

    if (result.rowCount === 0) {
      return null;
    }

    const {
      title,
      author,
      created_at: createdAt,
      updated_at: updatedAt,
      blocks
    } = result.rows[0];

    return {
      id,
      title,
      author,
      createdAt,
      updatedAt,
      blocks
    };
  }

  async upsertNotebook(patch: NotebookPatch): Promise<Notebook> {
    const result = await this._pool.query<{
      id: string;
      author: string;
      title: string;
      created_at: Date;
      updated_at: Date;
      blocks: NotebookBlock[];
    }>(
      `
        insert into notebooks
          (id, author, title, blocks)
        values
          (
            $1,
            $2,
            case
              when $3::varchar is null then ''
              else $3::varchar
            end,
            case
              when $4::json is null then '[]'
              else $4::json
            end
          )
        on conflict(id)
        do update set
          title = case
            when $3::varchar is null then excluded.title
            else $3::varchar
          end,
          blocks = case
            when $4::json is null then excluded.blocks
            else $4::json
          end,
          updated_at = now()
        returning *
      `,
      [patch.id, patch.author, patch.title, JSON.stringify(patch.blocks)]
    );

    if (result.rowCount === 0) {
      throw new Error("Failed to insert notebook");
    }

    const {
      id,
      title,
      author,
      created_at: createdAt,
      updated_at: updatedAt,
      blocks
    } = result.rows[0];

    return {
      id,
      title,
      author,
      createdAt,
      updatedAt,
      blocks
    };
  }

  async notebooksByAuthor(author: string): Promise<Notebook[]> {
    const result = await this._pool.query<{
      id: string;
      author: string;
      title: string;
      created_at: Date;
      updated_at: Date;
      blocks: NotebookBlock[];
    }>(
      `
        select * from notebooks where author = $1
      `,
      [author]
    );

    return result.rows.map(
      ({
        id,
        title,
        author,
        created_at: createdAt,
        updated_at: updatedAt,
        blocks
      }) => ({
        id,
        title,
        author,
        createdAt,
        updatedAt,
        blocks
      })
    );
  }

  async deleteNotebook(id: string, authorId: string) {
    await this._pool.query(
      "delete from notebooks where id = $1 and author = $2",
      [id, authorId]
    );
  }
}
