export type Result =
  | {
      __type: "PACKAGE";
      id: string;
      name: string;
    }
  | {
      __type: "CLASS_DOC";
      simpleName: string;
      qualifiedName: string;
    };

export default class Search {
  constructor(private _host: string) {}

  static create() {
    return new Search(process.env.SEARCH_HOST || "http://localhost:8086");
  }

  async search(
    term: string,
    limit: number,
    offset: number
  ): Promise<{ count: number; results: Result[] }> {
    const response = await fetch(
      `${this._host}/search?term=${term}&limit=${limit}&offset=${offset}`
    );

    if (response.status !== 200) {
      throw new Error(await response.text());
    }

    return response.json();
  }
}
