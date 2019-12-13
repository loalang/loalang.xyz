import { Database } from "./Database";
import { PackagePublishedEvent } from "./Queue";

export default class IngestPackage {
  constructor(private readonly _database: Database) {}

  async ingest({ name }: PackagePublishedEvent) {
    await this._database.save(name, {});
  }
}
