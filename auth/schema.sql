CREATE TABLE "users" (
    "id" uuid NOT NULL,
    "username" varchar NOT NULL UNIQUE,
    "email" varchar NOT NULL UNIQUE,
    "password" bytea NOT NULL,
    "signed_up_at" timestamp NOT NULL,
    "name" varchar,
    PRIMARY KEY ("id")
);

CREATE INDEX ON "users" ("username");
