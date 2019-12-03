import * as neo4j from "neo4j-driver";
import Integer from "./Integer";

export type DateTime = neo4j.default.DateTime<Integer>;

export const DateTime = neo4j.default.types.DateTime;

export function now(): DateTime {
  const now = DateTime.fromStandardDate(new Date());

  return new DateTime(
    Integer.fromInt(now.year),
    Integer.fromInt(now.month),
    Integer.fromInt(now.day),
    Integer.fromInt(now.hour),
    Integer.fromInt(now.minute),
    Integer.fromInt(now.second),
    Integer.fromInt(now.nanosecond),
    Integer.fromInt(now.timeZoneOffsetSeconds!)
  );
}
