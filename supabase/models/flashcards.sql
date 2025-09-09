create extension if not exists pgcrypto;

create table flashcards (
    id uuid primary key default gen_random_uuid(),
    deck_id uuid not null references decks(id) on delete cascade,
    front text not null,
    back text not null,
    difficulty varchar,
    position integer,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);