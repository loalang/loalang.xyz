create table packages (
    id uuid not null,
    name varchar not null,
    primary key (id)
);

create table versions (
    id uuid not null,
    version varchar not null,
    url varchar not null,
    published timestamp not null default now(),
    primary key (id, version),
    foreign key (id) references packages(id)
);
