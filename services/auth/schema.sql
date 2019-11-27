create database auth;

\connect auth;

create table users (
    id uuid,
    email varchar not null unique,
    password bytea not null,
    primary key (id)
);

create index on users (email);
