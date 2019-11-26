import Publication from "./Publication";

export default interface Storage {
  storePublication(publication: Publication): Promise<string>;
}
