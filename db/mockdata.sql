-- Insert mock data into user table
INSERT INTO "user" (username, mail) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com');

-- Insert mock data into tournament table
INSERT INTO tournament (tournament_code, tournament_name, status, start_date, end_date, n_max_participants, tags, user_id) VALUES
('T2024', 'Tournament 2024', 'en curso', '2024-01-01', '2024-12-31', 16, 'tag1,tag2', 1),
('T2025', 'Tournament 2025', 'proximamente', '2025-01-01', '2025-12-31', 32, 'tag3,tag4', 2);

-- Insert mock data into participant table
INSERT INTO participant (participant_name, tournament_id) VALUES
('Participant 1', 1),
('Participant 2', 1),
('Participant 3', 2),
('Participant 4', 2);

-- Insert mock data into match_bracket table
INSERT INTO match_bracket (participant_1_id, participant_2_id, tournament_id, home_result, away_result, status, "level") VALUES
(1, 2, 1, 3, 2, 'finalizado', 'quarterfinal'),
(3, 4, 2, 1, 1, 'en curso', 'semifinal');