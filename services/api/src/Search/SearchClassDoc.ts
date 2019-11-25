import ClassDoc from "../Resolvers/Documentation/ClassDoc";

export default class SearchClassDoc extends ClassDoc {
  readonly _qualifiedName: string;
  readonly _simpleName: string;

  constructor({
    simpleName,
    qualifiedName
  }: {
    simpleName: string;
    qualifiedName: string;
  }) {
    super();

    this._simpleName = simpleName;
    this._qualifiedName = qualifiedName;
  }

  simpleName(): string {
    return this._simpleName;
  }

  qualifiedName(): string {
    return this._qualifiedName;
  }
}
