// scripts/seed.js
// Realistic seeder for Supabase/Postgres using Service Role (bypasses RLS).
// Idempotent without relying on ON CONFLICT (no schema changes required).

import { createClient } from "@supabase/supabase-js";
import { addDays, subDays, addSeconds } from "date-fns";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

// ---------- ENV ----------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ---------- TUNING ----------
const USERS_TO_SEED = 8; // use up to N existing users
const DECKS_PER_USER = 6; // 6 themed decks per user
const CARDS_PER_DECK = 50; // ~50 meaningful cards per deck
const SESSIONS_PER_DECK = 3; // 3 sessions per deck
const RECORDS_PER_SESSION = 28; // ~28 reviews per session

// ---------- Curated Banks ----------
const BANKS = {
  "Spanish A1 Basics": {
    kind: "vocab",
    pairs: [
      ["hola", "hello"],
      ["adiós", "goodbye"],
      ["gracias", "thank you"],
      ["por favor", "please"],
      ["sí", "yes"],
      ["no", "no"],
      ["perdón", "sorry"],
      ["buenos días", "good morning"],
      ["buenas noches", "good night"],
      ["agua", "water"],
      ["pan", "bread"],
      ["leche", "milk"],
      ["café", "coffee"],
      ["amigo", "friend"],
      ["familia", "family"],
      ["escuela", "school"],
      ["trabajo", "work"],
      ["comer", "to eat"],
      ["beber", "to drink"],
      ["ir", "to go"],
      ["tener", "to have"],
      ["ser", "to be (essence)"],
      ["estar", "to be (state)"],
      ["grande", "big"],
      ["pequeño", "small"],
      ["rápido", "fast"],
      ["lento", "slow"],
      ["hoy", "today"],
      ["mañana", "tomorrow"],
      ["ayer", "yesterday"],
    ],
  },
  "JavaScript Fundamentals": {
    kind: "qa",
    items: [
      [
        "What is a closure?",
        "A function with its lexical scope preserved even when executed outside its defining scope.",
      ],
      [
        "Difference between let and var?",
        "`let` is block-scoped; `var` is function-scoped and hoists differently.",
      ],
      [
        "What is hoisting?",
        "JavaScript moves declarations to the top of their scope during compilation.",
      ],
      [
        "What is an arrow function?",
        "A concise function syntax that lexically binds `this`.",
      ],
      [
        "Explain `this` in JS.",
        "`this` refers to the caller context; value depends on how a function is invoked.",
      ],
      [
        "What is a promise?",
        "An object representing the eventual completion or failure of an async operation.",
      ],
      [
        "What does `===` do?",
        "Strict equality: compares value and type without coercion.",
      ],
      [
        "What is event loop?",
        "Mechanism that handles the call stack and queues for async callbacks.",
      ],
      [
        "Mutable vs immutable?",
        "Mutable objects can change; immutable ones cannot.",
      ],
      [
        "What is truthy/falsy?",
        'Values that coerce to true/false (e.g., 0, "", null are falsy).',
      ],
      [
        "Array map vs forEach?",
        "`map` returns a new array; `forEach` iterates without returning.",
      ],
      [
        "What is prototype?",
        "A mechanism by which objects inherit features from others.",
      ],
      [
        "Explain `async/await`.",
        "Syntactic sugar over promises to write async-looking code.",
      ],
      ["What is JSON?", "Text format for structured data."],
      ["What is NaN?", "Numeric “Not a Number”; note `NaN !== NaN`."],
    ],
  },
  "Biology: Cell Structure": {
    kind: "qa",
    items: [
      ["Function of mitochondria?", "ATP production via cellular respiration."],
      ["Role of ribosomes?", "Protein synthesis (translation)."],
      [
        "What is the nucleus?",
        "Organelle that houses DNA and controls cell activities.",
      ],
      [
        "Function of Golgi apparatus?",
        "Modification, sorting, and packaging of proteins/lipids.",
      ],
      [
        "What is cytoskeleton?",
        "Fibers providing shape and transport (microtubules, actin).",
      ],
      ["Osmosis?", "Diffusion of water across a semi-permeable membrane."],
      ["Chloroplast function?", "Photosynthesis in plant cells."],
      ["Lysosome role?", "Intracellular digestion and waste processing."],
      [
        "Endoplasmic reticulum types?",
        "Rough ER (with ribosomes), smooth ER (lipid synthesis, detox).",
      ],
      ["Cell membrane?", "Phospholipid bilayer controlling transport."],
    ],
  },
  "World Capitals": {
    kind: "vocab",
    pairs: [
      ["France", "Paris"],
      ["Japan", "Tokyo"],
      ["Canada", "Ottawa"],
      ["Brazil", "Brasília"],
      ["Australia", "Canberra"],
      ["Egypt", "Cairo"],
      ["Kenya", "Nairobi"],
      ["India", "New Delhi"],
      ["Germany", "Berlin"],
      ["Italy", "Rome"],
      ["Mexico", "Mexico City"],
      ["Peru", "Lima"],
      ["Spain", "Madrid"],
      ["Portugal", "Lisbon"],
      ["Turkey", "Ankara"],
      ["South Korea", "Seoul"],
      ["Thailand", "Bangkok"],
      ["Vietnam", "Hanoi"],
      ["Argentina", "Buenos Aires"],
      ["Norway", "Oslo"],
    ],
  },
  "Anatomy Basics": {
    kind: "qa",
    items: [
      ["Largest organ?", "Skin."],
      ["Bone-to-bone connector?", "Ligament."],
      ["Muscle-to-bone connector?", "Tendon."],
      ["Heart chambers?", "Four."],
      ["Primary breathing muscle?", "Diaphragm."],
      ["RBCs carry?", "Oxygen via hemoglobin."],
      ["Function of kidneys?", "Filter blood; regulate fluid/electrolytes."],
      ["Where is the femur?", "Thigh; longest bone."],
      ["Cerebellum function?", "Coordination and balance."],
      ["Function of alveoli?", "Gas exchange in the lungs."],
    ],
  },
  "Music Theory I": {
    kind: "qa",
    items: [
      ["Major scale pattern?", "W-W-H-W-W-W-H."],
      ["Perfect fifth ratio?", "3:2 frequency ratio."],
      ["What is a triad?", "A three-note chord: root, third, fifth."],
      ["Sharps vs flats?", "Sharps raise; flats lower."],
      ["Time signature 4/4?", "Four quarter-note beats per measure."],
      ["Relative minor of C major?", "A minor."],
      ["What is tempo?", "Speed of the beat (BPM)."],
      ["Key signature?", "Sharps/flats indicating the key."],
      ["Semitone?", "Smallest step in Western music."],
      ["Syncopation?", "Emphasis on normally weak/off beats."],
    ],
  },
};
const DECK_ORDER = [
  "Spanish A1 Basics",
  "JavaScript Fundamentals",
  "Biology: Cell Structure",
  "World Capitals",
  "Anatomy Basics",
  "Music Theory I",
];

// ---------- Helpers ----------
function buildCardsForDeck(deckName, targetCount) {
  const bank = BANKS[deckName];
  const cards = [];
  if (bank.kind === "vocab") {
    const base = bank.pairs.map(([term, def]) => ({
      q: `Translate to English: "${term}"`,
      a: def,
    }));
    const reverse = bank.pairs.map(([term, def]) => ({
      q: `Translate to ${
        deckName.startsWith("Spanish") ? "Spanish" : "the target language"
      }: "${def}"`,
      a: term,
    }));
    const examples = bank.pairs
      .slice(0, 15)
      .map(([term, def]) => ({ q: `What does "${term}" mean?`, a: def }));
    cards.push(...base, ...reverse, ...examples);
  } else {
    cards.push(...bank.items.map(([q, a]) => ({ q, a })));
    bank.items
      .slice(0, 10)
      .forEach(([q, a]) =>
        cards.push({ q: `Define: ${q.replace(/\?$/, "")}`, a })
      );
    bank.items.slice(0, 10).forEach(([q, a]) =>
      cards.push({
        q: `Give an example related to: ${q.replace(/\?$/, "")}`,
        a: `Example: ${a}`,
      })
    );
  }
  while (cards.length < targetCount && cards.length > 0) {
    const pick = cards[cards.length % Math.min(cards.length, 20)];
    const q = pick.q.includes("Translate")
      ? pick.q.replace("Translate", "Quick translate")
      : pick.q.startsWith("Define:")
      ? pick.q.replace("Define:", "Quick define:")
      : `Quick check: ${pick.q}`;
    cards.push({ q, a: pick.a });
  }
  return cards.slice(0, targetCount);
}

function scheduleNext(prevEase = 2.5, correct = true) {
  let ease = prevEase + (correct ? 0.1 : -0.2);
  ease = Math.min(3.5, Math.max(1.3, ease));
  const interval = correct
    ? Math.max(1, Math.round(ease * (1 + Math.random() * 3)))
    : 1;
  return { ease_factor: Number(ease.toFixed(2)), interval_days: interval };
}

async function getUsers(limit) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: limit,
  });
  if (error) throw error;
  return (data.users || []).map((u) => u.id);
}

// ---------- Idempotent helpers (no ON CONFLICT) ----------
async function upsertCategories() {
  const cats = [
    "Languages",
    "Programming",
    "Biology",
    "Geography",
    "Medicine",
    "Music",
  ];
  const now = new Date();
  const out = [];
  for (const name of cats) {
    // find by name
    const { data: existing, error: selErr } = await supabase
      .from("categories")
      .select("id,name")
      .eq("name", name)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
      out.push(existing);
      continue;
    }

    // insert if not found
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        description: `${name} related decks`,
        created_at: now,
        updated_at: now,
      })
      .select("id,name")
      .single();
    if (error) throw error;
    out.push(data);
  }
  return out;
}

async function createDeck(userId, categoryId, name, description) {
  const now = new Date();

  // check if deck exists for this user by name
  const { data: existing, error: selErr } = await supabase
    .from("decks")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) return existing; // { id }

  // insert if not found
  const { data, error } = await supabase
    .from("decks")
    .insert({
      name,
      description,
      user_id: userId,
      category_id: categoryId ?? null,
      is_public: Math.random() < 0.3,
      is_archived: false,
      created_at: now,
      updated_at: now,
      last_studied_at: null,
      study_count: 0,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data; // { id }
}

async function insertFlashcards(deckId, cards) {
  const now = new Date();

  // wipe existing cards for this deck to avoid duplicates on re-run
  const { error: delErr } = await supabase
    .from("flashcards")
    .delete()
    .eq("deck_id", deckId);
  if (delErr) throw delErr;

  const payload = cards.map((c, i) => ({
    deck_id: deckId,
    position: i + 1,
    front: c.q,
    back: c.a,
    difficulty: 1 + Math.floor(Math.random() * 3),
    created_at: subDays(now, i % 7),
    updated_at: now,
  }));
  const { error } = await supabase.from("flashcards").insert(payload);
  if (error) throw error;
}

// Remove existing sessions + records for a deck to avoid duplicates
async function clearDeckSessionsAndRecords(deckId) {
  const { data: sessions, error: sErr } = await supabase
    .from("study_sessions")
    .select("id")
    .eq("deck_id", deckId);
  if (sErr) throw sErr;

  const sessionIds = (sessions || []).map((s) => s.id);

  // delete dependent records first
  if (sessionIds.length) {
    const { error: rErr } = await supabase
      .from("card_study_records")
      .delete()
      .in("study_session_id", sessionIds);
    if (rErr) throw rErr;
  }

  // delete sessions
  const { error: dErr } = await supabase
    .from("study_sessions")
    .delete()
    .eq("deck_id", deckId);
  if (dErr) throw dErr;
}

async function createStudySessions(userId, deckId) {
  // ensure idempotency per deck
  await clearDeckSessionsAndRecords(deckId);

  const sessions = [];
  for (let i = 0; i < SESSIONS_PER_DECK; i++) {
    const start = subDays(new Date(), 10 - i * 3);
    const durationSec = 300 + Math.floor(Math.random() * 1200);
    const end = addSeconds(start, durationSec);
    sessions.push({
      user_id: userId,
      deck_id: deckId,
      started_at: start,
      ended_at: end,
      cards_studied: 20 + Math.floor(Math.random() * 40),
      duration_seconds: durationSec,
      mode: Math.random() < 0.5 ? "flashcards" : "quiz",
    });
  }
  const { data, error } = await supabase
    .from("study_sessions")
    .insert(sessions)
    .select("id,user_id,deck_id,started_at,ended_at");
  if (error) throw error;
  return data || [];
}

async function sampleFlashcards(deckId, n) {
  const { data, error } = await supabase
    .from("flashcards")
    .select("id")
    .eq("deck_id", deckId);
  if (error) throw error;
  const shuffled = faker.helpers.shuffle((data || []).map((r) => r.id));
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

async function createStudyRecords(session, userId, deckId) {
  const flashcardIds = await sampleFlashcards(deckId, RECORDS_PER_SESSION);
  let ease = 2.5;
  const records = flashcardIds.map((fid) => {
    const isCorrect = Math.random() < 0.72;
    const { ease_factor, interval_days } = scheduleNext(ease, isCorrect);
    ease = ease_factor;
    const last = faker.date.between({
      from: new Date(session.started_at),
      to: new Date(session.ended_at),
    });
    const nextReview = addDays(last, interval_days);
    return {
      user_id: userId,
      flashcard_id: fid,
      study_session_id: session.id,
      is_correct: isCorrect,
      ease_factor,
      interval_days,
      next_review_at: nextReview,
      times_reviewed: 1 + Math.floor(Math.random() * 4),
      times_correct: isCorrect
        ? 1 + Math.floor(Math.random() * 3)
        : Math.floor(Math.random() * 2),
      is_mastered: isCorrect && Math.random() < 0.2,
      last_reviewed_at: last,
      created_at: last,
    };
  });

  if (records.length) {
    // plain insert is safe because we cleared sessions beforehand
    const { error } = await supabase
      .from("card_study_records")
      .insert(records);
    if (error) throw error;
  }
}

async function updateDeckStats(deckId) {
  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select("started_at")
    .eq("deck_id", deckId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  const last = sessions?.[0]?.started_at ?? null;
  const count = sessions?.length ?? 0;
  const { error: upErr } = await supabase
    .from("decks")
    .update({
      last_studied_at: last,
      study_count: count,
      updated_at: new Date(),
    })
    .eq("id", deckId);
  if (upErr) throw upErr;
}

async function upsertUserDeckProgress(userId, deckId) {
  const { count: total, error: tErr } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", deckId);
  if (tErr) throw tErr;

  const { data: deckFlashcards, error: dfErr } = await supabase
    .from("flashcards")
    .select("id")
    .eq("deck_id", deckId);
  if (dfErr) throw dfErr;
  const deckIds = (deckFlashcards || []).map((r) => r.id);

  let mastered = 0;
  if (deckIds.length) {
    const { count: mCount, error: mErr } = await supabase
      .from("card_study_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_mastered", true)
      .in("flashcard_id", deckIds);
    if (mErr) throw mErr;
    mastered = mCount || 0;
  }

  let toReview = 0;
  if (deckIds.length) {
    const { count: rCount, error: rErr } = await supabase
      .from("card_study_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("flashcard_id", deckIds);
    if (rErr) throw rErr;
    toReview = rCount || 0;
  }

  const learning = Math.max(0, Math.floor((total || 0) * 0.3) - mastered);
  const completion = total ? Number(((mastered / total) * 100).toFixed(1)) : 0;

  const row = {
    user_id: userId,
    deck_id: deckId,
    cards_mastered: mastered,
    cards_learning: Math.max(0, learning),
    cards_to_review: toReview,
    completion_percentage: completion,
    current_streak: Math.floor(Math.random() * 8),
    longest_streak: 8 + Math.floor(Math.random() * 20),
    last_studied_at: subDays(new Date(), Math.floor(Math.random() * 5)),
    created_at: new Date(),
    updated_at: new Date(),
  };

  // upsert-like behavior without ON CONFLICT:
  const { data: existing, error: selErr } = await supabase
    .from("user_deck_progress")
    .select("user_id,deck_id")
    .eq("user_id", userId)
    .eq("deck_id", deckId)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error: updErr } = await supabase
      .from("user_deck_progress")
      .update(row)
      .eq("user_id", userId)
      .eq("deck_id", deckId);
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase
      .from("user_deck_progress")
      .insert(row);
    if (insErr) throw insErr;
  }
}

// ---------- Main ----------
async function main() {
  console.log("⏳ Seeding…");

  const users = await getUsers(USERS_TO_SEED);
  if (!users.length)
    throw new Error("No users in auth.users. Create some test users first.");

  const categories = await upsertCategories();
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const categoryMap = {
    "Spanish A1 Basics": catByName["Languages"],
    "JavaScript Fundamentals": catByName["Programming"],
    "Biology: Cell Structure": catByName["Biology"],
    "World Capitals": catByName["Geography"],
    "Anatomy Basics": catByName["Medicine"],
    "Music Theory I": catByName["Music"],
  };

  for (const userId of users) {
    const deckNames = DECK_ORDER.slice(0, DECKS_PER_USER);
    for (const deckName of deckNames) {
      const deck = await createDeck(
        userId,
        categoryMap[deckName],
        deckName,
        `${deckName} deck with curated content`
      );
      const cards = buildCardsForDeck(deckName, CARDS_PER_DECK);
      await insertFlashcards(deck.id, cards);

      const sessions = await createStudySessions(userId, deck.id);
      for (const s of sessions) {
        await createStudyRecords(s, userId, deck.id);
      }
      await updateDeckStats(deck.id);
      await upsertUserDeckProgress(userId, deck.id);

      console.log(`✓ ${deckName} for user ${userId} (deck ${deck.id})`);
    }
  }
  console.log("✅ Done.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
