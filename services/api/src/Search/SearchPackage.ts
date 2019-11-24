import Package from "../Resolvers/Package";

export default class SearchPackage extends Package {
  readonly name: string;

  constructor({ name }: { name: string }) {
    super();

    this.name = name;
  }
}
