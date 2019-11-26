export default interface Notifier {
  notifyPackagePublished(
    id: string,
    name: string,
    version: string,
    url: string
  ): Promise<void>;
}
