create extension if not exists pgcrypto;

create table categories (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
