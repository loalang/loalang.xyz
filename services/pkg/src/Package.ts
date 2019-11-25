export default interface Package {
  id: string;
  name: string;
  versions: PackageVersion[];
}

export interface PackageVersion {
  version: string;
  url: string;
  published: Date;
}
