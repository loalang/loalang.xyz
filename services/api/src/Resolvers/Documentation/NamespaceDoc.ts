import Context from "../../Context";

export default class NamespaceDoc {
  constructor(public readonly name: string) {}

  async subNamespaces({}: {}, { docs }: Context): Promise<NamespaceDoc[]> {
    const subNamespaces = await docs.subNamespaces(this.name);

    return subNamespaces.map(n => new NamespaceDoc(n));
  }
}
