import User from "./User";

export default class Notebook {
  public readonly id: string;
  public title: string;
  public updatedAt: Date;
  public blocks: NotebookBlock[];

  constructor(
    public readonly author: User,
    public readonly createdAt: Date,
    input: NotebookInput
  ) {
    this.id = input.id;
    this.title = input.title;
    this.blocks = NotebookBlock.fromInputs(input.blocks);
    this.updatedAt = createdAt;
  }

  update({ title, blocks }: NotebookInput) {
    this.title = title;
    this.blocks = NotebookBlock.fromInputs(blocks);
    this.updatedAt = new Date();
  }
}

export interface NotebookInput {
  id: string;
  title: string;
  blocks: NotebookBlockInput[];
}

export interface NotebookBlockInput {
  code?: CodeNotebookBlock;
}

export type NotebookBlock = CodeNotebookBlock;

export namespace NotebookBlock {
  export function fromInput(block: NotebookBlockInput): NotebookBlock | null {
    if (block.code != null) {
      return block.code;
    } else {
      return null;
    }
  }

  export function fromInputs(blocks: NotebookBlockInput[]): NotebookBlock[] {
    return blocks
      .map(NotebookBlock.fromInput)
      .filter((b): b is NotebookBlock => b != null);
  }
}

export interface CodeNotebookBlock {
  id: string;
  code: string;
}
