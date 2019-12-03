import { decode, encode, VERSION_PART_SIZE } from "./versionEncoding";
import { SemVer } from "semver";

describe("toSemVer", () => {
  it("converts an int to a semantic version", () => {
    expect(decode({ version: 1 }).format()).toBe("0.0.1");
    expect(decode({ version: 1 << VERSION_PART_SIZE }).format()).toBe("0.1.0");
    expect(decode({ version: 15 << (VERSION_PART_SIZE * 2) }).format()).toBe(
      "15.0.0"
    );
  });

  it("converts a semver object to an int", () => {
    const examples = [
      new SemVer("1.0.0"),
      new SemVer("10.0.0"),
      new SemVer("870.10.10"),
      new SemVer("0.0.10"),
      new SemVer("0.0.10-alpha"),
      new SemVer("0.0.10-alpha.2")
    ];

    for (const example of examples) {
      expect(decode(encode(example)).compare(example)).toBe(0);
    }
  });
});
