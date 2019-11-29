import Storage from "./Storage";
import Publication from "./Publication";
import { Storage as GStorage, Bucket } from "@google-cloud/storage";
import path from "path";

const credentials = require(path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json"
));

const gstorage = new GStorage({
  credentials
});

const bucket = new Bucket(gstorage, "loalang-pkg");

export default class GoogleStorage implements Storage {
  async storePublication(publication: Publication): Promise<string> {
    const file = bucket.file(
      `${publication.name}/${publication.version}.tar.gz`
    );

    if (file.id == null) {
      throw new Error("Id was not generated.");
    }

    await new Promise((resolve, reject) =>
      publication.tarball
        .pipe(file.createWriteStream())
        .on("error", reject)
        .on("finish", resolve)
        .on("close", resolve)
    );

    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${decodeURIComponent(
      file.id
    )}`;
  }
}
