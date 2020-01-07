import Context from "../Context";

export default class Notebook {
  public readonly id: string;
  public readonly title: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly blocks: NotebookBlock[];

  private readonly authorId: string;

  constructor(record: {
    id: string;
    title: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    blocks: NotebookBlock[];
  }) {
    this.id = record.id;
    this.title = record.title;
    this.authorId = record.author;
    this.createdAt = new Date(record.createdAt);
    this.updatedAt = new Date(record.updatedAt);
    this.blocks = record.blocks;
  }

  async author({}: {}, { auth }: Context) {
    return auth.findUser({ id: this.authorId });
  }
}

export interface NotebookInput {
  id: string;
  title: string;
  blocks: NotebookBlockInput[];
}

export interface NotebookBlockInput {
  code?: CodeNotebookBlock;
  text?: TextNotebookBlock;
}

export type NotebookBlock = CodeNotebookBlock | TextNotebookBlock;

export namespace NotebookBlock {
  export function fromInput(block: NotebookBlockInput): NotebookBlock | null {
    if (block.code != null) {
      return block.code;
    } else if (block.text != null) {
      return block.text;
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

export interface TextNotebookBlock {
  id: string;
  text: string;
}
