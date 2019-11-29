import { Readable } from "stream";
import { IncomingMessage } from "http";
import HttpError from "./HttpError";

export default interface Publication {
  name: string;
  version: string;
  publisherId: string;
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

  const publisherId = req.headers["x-publisher-id"];
  if (publisherId == null) {
    throw new HttpError(400, "Required X-Publisher-Id to be set");
  }
  if (Array.isArray(publisherId)) {
    throw new HttpError(400, "Cannot publish as multiple publishers");
  }

  if (typeof version !== "string") {
    throw new HttpError(400, "Required query param: version");
  }

  return {
    name,
    version,
    publisherId,
    tarball: req
  };
}
