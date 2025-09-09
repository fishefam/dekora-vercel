create extension if not exists pgcrypto;

create table decks (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    description text,
    user_id uuid not null references auth.users(id) on delete cascade,
    category_id uuid references categories(id) on delete set null,
    is_public boolean default false,
    is_archived boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    last_studied_at timestamptz,
    study_count integer default 0
);