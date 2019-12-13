export type Doc = PackageDoc;

export interface PackageDoc {}

export interface Database {
  rootNamespaces(): Promise<string[]>;
  save(qualifiedName: string, doc: Doc): Promise<void>;
}
