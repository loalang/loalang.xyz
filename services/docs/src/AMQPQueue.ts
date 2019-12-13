import { connect, Connection } from "amqplib";
import Queue, { PackagePublishedEvent } from "./Queue";

export default class AMQPQueue implements Queue {
  private constructor(private readonly _connecting: Promise<Connection>) {}

  static create() {
    return new AMQPQueue(connect(process.env.AMQP_URL || ""));
  }

  async onPackagePublished(
    cb: (event: PackagePublishedEvent) => Promise<void> | void
  ) {
    const connection = await this._connecting;
    const channel = await connection.createChannel();
    await channel.assertQueue("package-published->docs");
    await channel.consume("package-published->docs", async msg => {
      if (msg != null) {
        await cb(JSON.parse(msg.content.toString("utf-8")));
        channel.ack(msg);
      }
    });
  }
}
