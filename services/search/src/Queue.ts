export default interface Queue {
  onPackagePublished(cb: (event: PackagePublishedEvent) => void): Promise<void>;
}

export interface PackagePublishedEvent {
  id: string;
  name: string;
  version: string;
  url: string;
}
