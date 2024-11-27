-- Drop tables if they exist
DROP TABLE IF EXISTS match_game;
DROP TABLE IF EXISTS match_bracket;
DROP TABLE IF EXISTS round;
DROP TABLE IF EXISTS tournament_groups;
DROP TABLE IF EXISTS participant;
DROP TABLE IF EXISTS tournament;
DROP TABLE IF EXISTS "user";

-- Create the users table
CREATE TABLE "user" (
    mail TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    created_at DATE NOT NULL,
    active BOOLEAN NOT NULL
);

-- Create the tournaments table
CREATE TABLE tournament (
    tournament_id SERIAL PRIMARY KEY,
    tournament_code TEXT NOT NULL,
    tournament_name TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    n_max_participants INTEGER NOT NULL,
    tags TEXT NOT NULL,
    user_mail TEXT NOT NULL
);

-- Create the participants table
CREATE TABLE participant (
    participant_id SERIAL PRIMARY KEY,
    participant_name TEXT NOT NULL,
    tournament_id INTEGER NOT NULL REFERENCES tournament(tournament_id)
);

-- Create the tournament_groups table
CREATE TABLE tournament_groups (
    group_id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournament(tournament_id),
    group_number INTEGER NOT NULL
);

-- Create the rounds table
CREATE TABLE round (
    round_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES tournament_groups(group_id),
    round_number INTEGER NOT NULL
);

-- Create the matches table
CREATE TABLE match_bracket (
    match_id SERIAL PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES round(round_id),
    participant_1_id TEXT, -- Can be NULL, participant ID, or "EMPTY_SPOT"
    participant_2_id TEXT, -- Can be NULL, participant ID, or "EMPTY_SPOT"
    home_result INTEGER DEFAULT 0,
    away_result INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    match_number INTEGER NOT NULL
);

-- Create the match_games table
CREATE TABLE match_game (
    match_game_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES match_bracket(match_id),
    participant_1_score INTEGER DEFAULT 0,
    participant_2_score INTEGER DEFAULT 0,
    game_status TEXT NOT NULL
);
