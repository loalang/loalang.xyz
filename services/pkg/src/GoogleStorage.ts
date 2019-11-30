import Storage from "./Storage";
import Publication from "./Publication";
import { Storage as GStorage, Bucket } from "@google-cloud/storage";
import path from "path";
import { createHash } from "crypto";
import { Stream } from "stream";
import HttpError from "./HttpError";

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

    const checksum = createHash("sha1");

    await Promise.all([
      streamToPromise(publication.tarball.pipe(file.createWriteStream())),
      streamToPromise(publication.tarball.pipe(checksum))
    ]);

    await file.makePublic();

    const url =
      "https://storage.googleapis.com" +
      `/${bucket.name}/${decodeURIComponent(file.id)}`;

    if (publication.checksum !== checksum.digest("hex")) {
      await file.delete();
      throw new HttpError(400, "Checksum mismatch");
    }

    return url;
  }
}

async function streamToPromise(stream: Stream): Promise<void> {
  await new Promise((resolve, reject) =>
    stream
      .on("error", reject)
      .on("finish", resolve)
      .on("close", resolve)
  );
}
