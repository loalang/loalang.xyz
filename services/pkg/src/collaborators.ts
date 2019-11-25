import { Storage, Bucket } from "@google-cloud/storage";
import { PubSub } from "@google-cloud/pubsub";
import path from "path";
import { Pool } from "pg";

export const database = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DATABASE || "postgres"
});

export const credentials = require(path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json"
));

export const pubsub = new PubSub({
  credentials
});
export const topic = pubsub.topic("projects/loalang/topics/published-package");
export const storage = new Storage({
  credentials
});
export const bucket = new Bucket(storage, "loalang-pkg");
