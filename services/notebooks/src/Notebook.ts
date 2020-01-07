import * as Joi from "@hapi/joi";

export interface CodeNotebookBlock {
  __type: "CODE";
  id: string;
  code: string;
}

export namespace CodeNotebookBlock {
  export const SCHEMA = Joi.object({
    __type: "CODE",
    id: Joi.string().required(),
    code: Joi.string()
      .allow("")
      .required()
  });
}

export interface TextNotebookBlock {
  __type: "TEXT";
  id: string;
  text: string;
}

export namespace TextNotebookBlock {
  export const SCHEMA = Joi.object({
    __type: "TEXT",
    id: Joi.string().required(),
    text: Joi.string()
      .allow("")
      .required()
  });
}

export type NotebookBlock = CodeNotebookBlock | TextNotebookBlock;

export namespace NotebookBlock {
  export const SCHEMA = Joi.alternatives([
    CodeNotebookBlock.SCHEMA,
    TextNotebookBlock.SCHEMA
  ]);
}

export interface Notebook {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  blocks: NotebookBlock[];
}

export namespace Notebook {
  export const SCHEMA = Joi.object({
    id: Joi.string().required(),
    title: Joi.string()
      .allow("")
      .required(),
    author: Joi.string().required(),
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
    blocks: Joi.array()
      .items(NotebookBlock.SCHEMA)
      .required()
  });
}

export interface NotebookPatch {
  id: string;
  author: string;
  title?: string;
  blocks?: NotebookBlock[];
}

export namespace NotebookPatch {
  export const SCHEMA = Joi.object({
    id: Joi.string().required(),
    author: Joi.string().required(),
    title: Joi.string(),
    blocks: Joi.array().items(NotebookBlock.SCHEMA)
  });
}
