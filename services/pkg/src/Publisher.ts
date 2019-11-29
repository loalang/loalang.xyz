import Package from "./Package";

export default interface Publisher {
  id: string;
  packages: Package[];
}
