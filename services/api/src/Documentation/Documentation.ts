export default class Documentation {
  static create() {
    return new Documentation();
  }

  async rootNamespaces(): Promise<string[]> {
    const response = await fetch(`${process.env.DOCS_HOST}/root-namespaces`);
    const { namespaces } = await response.json();

    return namespaces;
  }

  async subNamespaces(namespace: string): Promise<string[]> {
    return [];
  }
}
