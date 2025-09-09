create extension if not exists pgcrypto;

create table study_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    deck_id uuid not null,
    started_at timestamptz,
    ended_at timestamptz,
    cards_studied integer,
    duration_seconds integer,
    mode varchar
);
