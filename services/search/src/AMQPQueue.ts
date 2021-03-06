import { connect, Connection } from "amqplib";
import Queue, { PackagePublishedEvent } from "./Queue";

export default class AMQPQueue implements Queue {
  private constructor(private readonly _connecting: Promise<Connection>) {}

  static create() {
    return new AMQPQueue(connect(process.env.AMQP_URL || ""));
  }

  async onPackagePublished(cb: (event: PackagePublishedEvent) => void) {
    const connection = await this._connecting;
    const channel = await connection.createChannel();
    await channel.assertQueue("package-published->search");
    await channel.consume("package-published->search", msg => {
      if (msg != null) {
        cb(JSON.parse(msg.content.toString("utf-8")));
        channel.ack(msg);
      }
    });
  }
}
