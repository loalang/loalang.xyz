import { parseDependencyHeader } from "./Publication";
import { SemVer } from "semver";

describe("parseDependencyHeader", () => {
  it("parses the X-Dependency header", () => {
    expect(parseDependencyHeader("My/Package")).toEqual([
      {
        package: "My/Package",
        development: false,
        version: new SemVer("0.0.0")
      }
    ]);

    expect(parseDependencyHeader("My/Package=1")).toEqual([
      {
        package: "My/Package",
        development: false,
        version: new SemVer("1.0.0")
      }
    ]);

    expect(parseDependencyHeader("My/Package=13;dev")).toEqual([
      {
        package: "My/Package",
        development: true,
        version: new SemVer("13.0.0")
      }
    ]);

    expect(parseDependencyHeader("My/Package=13.2; dev")).toEqual([
      {
        package: "My/Package",
        development: true,
        version: new SemVer("13.2.0")
      }
    ]);

    expect(parseDependencyHeader("My/Package=13.3.2; dev;")).toEqual([
      {
        package: "My/Package",
        development: true,
        version: new SemVer("13.3.2")
      }
    ]);

    expect(parseDependencyHeader("My/Package=14-alpha;")).toEqual([
      {
        package: "My/Package",
        development: false,
        version: new SemVer("14.0.0-alpha")
      }
    ]);

    expect(
      parseDependencyHeader("My/Package=14-alpha, My/Other/Package=1")
    ).toEqual([
      {
        package: "My/Package",
        development: false,
        version: new SemVer("14.0.0-alpha")
      },
      {
        package: "My/Other/Package",
        development: false,
        version: new SemVer("1.0.0")
      }
    ]);
  });
});
