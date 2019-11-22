import { Client, RequestParams, ApiResponse } from "@elastic/elasticsearch";

export default class ElasticSearch {
  constructor(private _client: Client) {}

  static create() {
    return new ElasticSearch(
      new Client({
        node: process.env.ELASTIC_HOST || "http://localhost:9200"
      })
    );
  }

  async search<T>(
    params: RequestParams.Search<T>
  ): Promise<{ total: number; hits: T[] }> {
    const response = await this._client.search(params);

    return {
      total: response.body.hits.total.value,
      hits: response.body.hits.hits.map(({ _source }: any) => _source)
    };
  }
}
