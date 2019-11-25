import { Readable } from "stream";
import { IncomingMessage } from "http";
import HttpError from "./HttpError";

export default interface Publication {
  name: string;
  version: string;
  tarball: Readable;
}

export function parse(
  name: string,
  version: string | null,
  req: IncomingMessage
): Publication {
  if (req.headers["content-type"] !== "application/tar+gzip") {
    throw new HttpError(400, "Required Content-Type: application/tar+gzip");
  }

  if (typeof version !== "string") {
    throw new HttpError(400, "Required query param: version");
  }

  return {
    name,
    version,
    tarball: req
  };
}
