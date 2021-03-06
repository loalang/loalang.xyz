import Notifier from "./Notifier";
import { connect } from "amqplib";

export interface PackagePublishedEvent {
  id: string;
  name: string;
  version: string;
  url: string;
}

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
    await channel.assertQueue("package-published->search");
    await channel.assertQueue("package-published->docs");
    const buffer = Buffer.from(
      JSON.stringify({ id, name, version, url } as PackagePublishedEvent)
    );
    await channel.sendToQueue("package-published->search", buffer);
    await channel.sendToQueue("package-published->docs", buffer);
  }
}
