-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-10-20 22:44:26.602

-- tables
-- Table: match_bracket
CREATE TABLE match_bracket (
    match_bracket_id serial  NOT NULL,
    participant_1_id int  NOT NULL,
    participant_2_id int  NOT NULL,
    tournament_id int  NOT NULL,
    home_result int  NOT NULL,
    away_result int  NOT NULL,
    status Varchar(255)  NOT NULL,
    "level" Varchar(255)  NOT NULL,
    CONSTRAINT match_bracket_pk PRIMARY KEY (match_bracket_id)
);

-- Table: participant
CREATE TABLE participant (
    participant_id serial  NOT NULL,
    participant_name Varchar(512)  NOT NULL,
    tournament_id int  NOT NULL,
    CONSTRAINT participant_pk PRIMARY KEY (participant_id)
);

-- Table: tournament
CREATE TABLE tournament (
    tournament_id serial  NOT NULL,
    tournament_code Varchar(8)  NOT NULL,
    tournament_name Varchar(512)  NOT NULL,
    status Varchar(255)  NOT NULL,
    start_date date  NOT NULL,
    end_date date  NOT NULL,
    n_max_participants int  NOT NULL,
    tags Varchar(512)  NOT NULL,
    user_mail varchar(255)  NOT NULL,
    CONSTRAINT tournament_pk PRIMARY KEY (tournament_id)
);

-- Table: user
CREATE TABLE "user" (
    mail varchar(255)  NOT NULL,
    username varchar(255)  NOT NULL,
    created_at date  NOT NULL,
    active boolean  NOT NULL,
    CONSTRAINT user_pk PRIMARY KEY (mail)
);

-- foreign keys
-- Reference: match_bracket_participant_away (table: match_bracket)
ALTER TABLE match_bracket ADD CONSTRAINT match_bracket_participant_away
    FOREIGN KEY (participant_2_id)
    REFERENCES participant (participant_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: match_bracket_participant_home (table: match_bracket)
ALTER TABLE match_bracket ADD CONSTRAINT match_bracket_participant_home
    FOREIGN KEY (participant_1_id)
    REFERENCES participant (participant_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: match_bracket_tournament (table: match_bracket)
ALTER TABLE match_bracket ADD CONSTRAINT match_bracket_tournament
    FOREIGN KEY (tournament_id)
    REFERENCES tournament (tournament_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: participant_tournament (table: participant)
ALTER TABLE participant ADD CONSTRAINT participant_tournament
    FOREIGN KEY (tournament_id)
    REFERENCES tournament (tournament_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tournament_user (table: tournament)
ALTER TABLE tournament ADD CONSTRAINT tournament_user
    FOREIGN KEY (user_mail)
    REFERENCES "user" (mail)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

