import { Pool } from "pg";
import Notifier from "./Notifier";
import AMQPNotifier from "./AMQPNotifier";
import GoogleStorage from "./GoogleStorage";
import Storage from "./Storage";

export const database = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DATABASE || "postgres"
});

export const notifier: Notifier = new AMQPNotifier();

export const storage: Storage = new GoogleStorage();
