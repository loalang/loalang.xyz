import { parseDependencyHeader } from "./Publication";

describe("parseDependencyHeader", () => {
  it("parses the X-Dependency header", () => {
    expect(parseDependencyHeader("My/Package")).toEqual({
      package: "My/Package",
      development: false,
      major: null,
      minor: null,
      patch: null,
      prerelease: null
    });

    expect(parseDependencyHeader("My/Package=1")).toEqual({
      package: "My/Package",
      development: false,
      major: 1,
      minor: null,
      patch: null,
      prerelease: null
    });

    expect(parseDependencyHeader("My/Package=13;dev")).toEqual({
      package: "My/Package",
      development: true,
      major: 13,
      minor: null,
      patch: null,
      prerelease: null
    });

    expect(parseDependencyHeader("My/Package=13.2; dev")).toEqual({
      package: "My/Package",
      development: true,
      major: 13,
      minor: 2,
      patch: null,
      prerelease: null
    });

    expect(parseDependencyHeader("My/Package=13.3.2; dev;")).toEqual({
      package: "My/Package",
      development: true,
      major: 13,
      minor: 3,
      patch: 2,
      prerelease: null
    });

    expect(parseDependencyHeader("My/Package=14-alpha;")).toEqual({
      package: "My/Package",
      development: false,
      major: 14,
      minor: null,
      patch: null,
      prerelease: "alpha"
    });
  });
});
