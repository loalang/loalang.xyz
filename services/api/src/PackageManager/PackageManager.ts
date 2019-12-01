import PackageManagerPackage from "./PackageManagerPackage";
import { Readable } from "stream";
import Package, { PackageVersion } from "../Resolvers/Package";
import http, { IncomingMessage } from "http";
import LoggedInUser from "../Authentication/LoggedInUser";

export default class PackageManager {
  constructor(private _host: string) {}

  static create() {
    return new PackageManager(process.env.PKG_HOST || "http://localhost:8087");
  }

  async find(name: string): Promise<PackageManagerPackage | null> {
    const response = await fetch(`${this._host}/packages/${name}`);
    if (response.status === 404) {
      return null;
    }
    if (response.status !== 200) {
      throw new Error(await response.text());
    }
    return new PackageManagerPackage((await response.json()).package);
  }

  async publish(
    name: string,
    version: string,
    stream: Readable,
    user: LoggedInUser,
    checksum: string
  ): Promise<Package> {
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      const request = http.request(
        `${this._host}/packages/${name}?version=${version}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/tar+gzip",
            "X-Publisher-Id": user.id,
            "X-Checksum": checksum
          }
        }
      );
      stream.pipe(request);
      request.once("response", resolve).once("error", reject);
    });

    if (response.statusCode !== 201) {
      throw new Error(await collectString(response));
    }

    return collectString(response)
      .then(JSON.parse)
      .then(r => new PackageManagerPackage(r.package));
  }

  async packagesOwnedBy(user: LoggedInUser): Promise<Package[]> {
    const response = await fetch(`${this._host}/publishers/${user.id}`);
    if (response.status !== 200) {
      throw new Error(await response.text());
    }
    const {
      publisher: { packages }
    } = await response.json();
    return packages.map((r: any) => new PackageManagerPackage(r));
  }

  async resolve(requests: {
    [name: string]: string;
  }): Promise<{ package: string; version: string }[]> {
    const response = await fetch(`${this._host}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requests)
    });

    if (response.status !== 200) {
      throw new Error(await response.text());
    }

    const { resolved } = await response.json();

    return resolved;
  }
}

function collectString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", c => (buffer += c.toString("utf-8")))
      .once("error", reject)
      .once("end", () => resolve(buffer));
  });
}
