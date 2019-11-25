import Search from "./Search/Search";
import PackageManager from "./PackageManager/PackageManager";

export default interface Context {
  search: Search;
  pkg: PackageManager;
}
