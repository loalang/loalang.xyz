import Notifier from "./Notifier";
import { connect } from "amqplib";

export default class AMQPNotifier implements Notifier {
  async notifyPackagePublished(
    id: string,
    name: string,
    version: string,
    url: string
  ): Promise<void> {
    const channel = await (
      await connect(process.env.AMQP_URL || "")
    ).createChannel();
    await channel.assertQueue("package-published");
    await channel.sendToQueue(
      "package-published",
      Buffer.from(JSON.stringify({ id, name, version, url }))
    );
  }
}
