import ClassDoc from "../Resolvers/Documentation/ClassDoc";

export default class ElasticClassDoc extends ClassDoc {
  readonly qualifiedName: string;
  readonly simpleName: string;

  constructor({
    simpleName,
    qualifiedName
  }: {
    simpleName: string;
    qualifiedName: string;
  }) {
    super();

    this.simpleName = simpleName;
    this.qualifiedName = qualifiedName;
  }
}
