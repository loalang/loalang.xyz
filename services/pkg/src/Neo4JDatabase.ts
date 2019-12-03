import neo4j from "neo4j-driver";

export default class Neo4JDatabase {
  private constructor(private _driver: neo4j.Driver) {}

  static create() {
    return new Neo4JDatabase(
      neo4j.driver(
        `bolt://${process.env.NEO4J_HOST}`,
        neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASS!)
      )
    );
  }

  async session<T>(f: (session: Neo4JSession) => Promise<T>): Promise<T> {
    const session = this._driver.session();
    try {
      return await f(new Neo4JSession(session));
    } finally {
      session.close();
    }
  }

  close() {
    this._driver.close();
  }
}

class Neo4JSession {
  constructor(private readonly _session: neo4j.Session) {}

  async query<T>(
    fragments: TemplateStringsArray,
    ...variables: any[]
  ): Promise<T[]> {
    let query = fragments[0];
    if (query == null) {
      throw new Error("Empty query");
    }
    const vars: { [name: string]: any } = {};
    variables.forEach((variable, index) => {
      const name = `var${index}`;
      query += `{${name}}${fragments[index + 1]}`;
      vars[name] = variable;
    });
    const result = await this._session.run(query, vars);

    return result.records.map(r => (r.toObject() as any) as T);
  }
}
