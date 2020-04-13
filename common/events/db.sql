CREATE TABLE "consumer_groups" (
    "name" varchar NOT NULL,
    "offset" int8 DEFAULT 0,
    "topic" varchar NOT NULL,
    PRIMARY KEY ("name","topic")
);

CREATE TABLE "events" (
    "timestamp" timestamp NOT NULL DEFAULT now(),
    "topic" varchar NOT NULL,
    "payload" bytea
);

CREATE INDEX ON "events" ("topic");
