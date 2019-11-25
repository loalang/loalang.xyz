import { Readable } from "stream";
import { IncomingMessage } from "http";
import HttpError from "./HttpError";

export default interface Publication {
  name: string;
  version: string;
  tarball: Readable;
}

export function parse(req: IncomingMessage): Publication {
  if (req.headers["content-type"] !== "application/tar+gzip") {
    throw new HttpError(400, "Required Content-Type: application/tar+gzip");
  }

  const name = req.headers["x-loalang-pkg-name"];
  const version = req.headers["x-loalang-pkg-version"];

  if (typeof name !== "string") {
    throw new HttpError(400, "Required unique header: X-Loalang-Pkg-Name");
  }
  if (typeof version !== "string") {
    throw new HttpError(400, "Required unique header: X-Loalang-Pkg-Version");
  }

  return {
    name,
    version,
    tarball: req
  };
}
