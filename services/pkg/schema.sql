create database pkg;

\connect pkg;

create table packages (
    id uuid not null,
    name varchar not null,
    primary key (id)
);

create table root_namespace_owners (
    root_namespace varchar not null,
    owner_id uuid not null,
    primary key (root_namespace, owner_id)
);

create index on root_namespace_owners (root_namespace);

create table versions (
    id uuid not null,
    version varchar not null,
    url varchar not null,
    published timestamp not null default now(),
    publisher uuid not null,
    primary key (id, version),
    foreign key (id) references packages(id)
);
