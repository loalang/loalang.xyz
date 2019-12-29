export default abstract class ClassDoc {
  abstract name(): QualifiedNameDoc;
}

export interface QualifiedNameDoc {
  name: string;
  namespace: string | null;
}
