import Notifier from "./Notifier";
import AMQPNotifier from "./AMQPNotifier";
import GoogleStorage from "./GoogleStorage";
import Storage from "./Storage";
import Neo4JDatabase from "./Neo4JDatabase";

export const database = Neo4JDatabase.create();

process.on("beforeExit", () => database.close());

export const notifier: Notifier = new AMQPNotifier();

export const storage: Storage = new GoogleStorage();
