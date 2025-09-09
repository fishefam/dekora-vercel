create extension if not exists pgcrypto;

create table user_deck_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    deck_id uuid not null,
    cards_mastered integer,
    cards_learning integer,
    cards_to_review integer,
    completion_percentage numeric,
    current_streak integer,
    longest_streak integer,
    last_studied_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);