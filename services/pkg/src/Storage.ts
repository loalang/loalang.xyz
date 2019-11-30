import Publication from "./Publication";

export default interface Storage {
  storePublication(id: string, publication: Publication): Promise<string>;
}
