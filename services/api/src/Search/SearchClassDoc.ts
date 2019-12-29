import ClassDoc, {
  QualifiedNameDoc
} from "../Resolvers/Documentation/ClassDoc";

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

  name(): QualifiedNameDoc {
    return {
      name: this._simpleName,
      namespace: this._qualifiedName
        .split("/")
        .slice(0, -1)
        .join("/")
    };
  }
}
