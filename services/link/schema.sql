create database link;

\connect link;

create table links (
    id varchar,
    target varchar not null,
    primary key (id)
);
