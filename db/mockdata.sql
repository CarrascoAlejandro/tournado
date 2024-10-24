-- Insert mock data into user table
INSERT INTO "user" (mail, username, created_at, active) VALUES
('user1@example.com', 'User One', '2023-10-15', TRUE),
('user2@example.com', 'User Two', '2023-10-18', TRUE),
('user3@example.com', 'User Three', '2023-10-20', FALSE);


-- Insert mock data into tournament table
INSERT INTO tournament (tournament_code, tournament_name, status, start_date, end_date, n_max_participants, tags, user_mail) VALUES
('T2024A', 'Spring Championship', 'Active', '2024-01-15', '2024-02-15', 16, 'spring,championship', 'user1@example.com'),
('T2024B', 'Summer League', 'Pending', '2024-07-01', '2024-08-01', 32, 'summer,league', 'user2@example.com');

-- Insert mock data into participant table
INSERT INTO participant (participant_name, tournament_id) VALUES
('Team Alpha', 1),
('Team Beta', 1),
('Team Gamma', 2),
('Team Delta', 2);

-- Insert mock data into match_bracket table
INSERT INTO match_bracket (participant_1_id, participant_2_id, tournament_id, home_result, away_result, status, "level") VALUES
(1, 2, 1, 3, 1, 'Completed', 'Quarterfinal'),
(3, 4, 2, 2, 2, 'Pending', 'Semifinal');
