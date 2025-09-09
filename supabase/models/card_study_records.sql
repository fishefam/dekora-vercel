create extension if not exists pgcrypto;

create table card_study_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    flashcard_id uuid not null,
    study_session_id uuid not null references study_sessions(id) on delete cascade,
    is_correct boolean,
    ease_factor numeric,
    interval_days integer,
    next_review_at timestamptz,
    times_reviewed integer,
    times_correct integer,
    is_mastered boolean,
    last_reviewed_at timestamptz,
    created_at timestamptz default now()
);
