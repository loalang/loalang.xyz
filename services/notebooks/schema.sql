create database notebooks;

\connect notebooks;

create table notebooks (
    id uuid,
    author uuid not null,
    title varchar not null default '',
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    blocks json not null default '[]',
    primary key (id)
);
