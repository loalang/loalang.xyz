export type Doc = PackageDoc | NamespaceDoc | ClassDoc;

export interface PackageDoc {
  __type: "PACKAGE";
  name: QualifiedNameDoc;
  subNamespaces: string[];
  classes: string[];
}

export interface NamespaceDoc {
  __type: "NAMESPACE";
  name: QualifiedNameDoc;
  subNamespaces: string[];
  classes: string[];
}

export interface ClassDoc {
  __type: "CLASS";
  name: QualifiedNameDoc;
}

export interface QualifiedNameDoc {
  name: string;
  namespace: string | null;
}

export interface Database {
  rootNamespaces(): Promise<string[]>;
  saveClass(qualifiedName: string, doc: ClassDoc): Promise<void>;
  describe(qualifiedName: string): Promise<Doc | null>;
}
