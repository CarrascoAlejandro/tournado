import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  boolean,
  date
} from 'drizzle-orm/pg-core';
import { not, and, or, count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from "drizzle-orm";

export const db = drizzle(neon(process.env.POSTGRES_URL!));

// Tabla de usuarios
export const users = pgTable('user', {
  mail: text('mail').primaryKey().notNull(),
  username: text('username').notNull(),
  createdAt: date('created_at').notNull(), // Cambia esto si decides utilizar otro tipo
  active: boolean('active').notNull(),
});


// Función para insertar un nuevo usuario
export async function insertUser(mail: string, username: string) {
  try {
    await db.insert(users).values({ mail, username, createdAt: new Date().toISOString(), active: true });
    console.log(`Usuario ${username} insertado con éxito`);
  } catch (error) {
    console.error("Error al insertar usuario:", error);
    throw error;
  }
}

// Verificar si un usuario existe
export async function userExists(mail: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.mail, mail))
      .limit(1);

    return user.length > 0;
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    throw error;
  }
}

// Obtener toda la información del usuario por correo
export async function getUserByEmail(mail: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.mail, mail))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
}

// Desactivar un usuario
export async function deactivateUser(mail: string) {
  try {
    await db
      .update(users)
      .set({ active: false })
      .where(eq(users.mail, mail));

    console.log(`Usuario con correo ${mail} desactivado.`);
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    throw error;
  }
}

export async function getTournamentsByUser(userEmail: string) {
  try {
    // Fetch tournaments where the userId matches the provided userId
    const userTournaments = await db
      .select()
      .from(tournaments) // From the tournament table
      .where(eq(tournaments.userMail, userEmail)); // Filter by userId

    return userTournaments;
  } catch (error) {
    console.error('Error fetching tournaments by user:', error);
    throw error;
  }
}

export const statusEnum = pgEnum('status', ['Soon', 'In Progress', 'Finished']); // Se refiere a los estados posibles de un torneo



export const tournaments = pgTable('tournament', {
  tournamentId: serial('tournament_id').primaryKey(),
  tournamentCode: text('tournament_code').notNull(),
  tournamentName: text('tournament_name').notNull(),
  status: statusEnum('status').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  nMaxParticipants: integer('n_max_participants').notNull(),
  tags: text('tags').notNull(),
  userMail: text('user_mail').notNull()
});

export const participants = pgTable('participant', {
  participantId: serial('participant_id').primaryKey(),
  participantName: text('participant_name').notNull(),
  tournamentId: integer('tournament_id').notNull()
});


export const tournamentGroups = pgTable('tournament_groups', {//por eliminación simple solo tenemos 1 grupo por torneo
  groupId: serial('group_id').primaryKey(),
  tournamentId: integer('tournament_id').notNull(), // Foreign key to tournaments
  groupNumber: integer('group_number').notNull(), // Logical grouping within the tournament
});

export const rounds = pgTable('round', {
  roundId: serial('round_id').primaryKey(),
  groupId: integer('group_id').notNull(), // Foreign key to groups
  roundNumber: integer('round_number').notNull() // Order of the round in the group
});

export const matchBracket = pgTable('match_bracket', {
  matchId: serial('match_id').primaryKey(),
  roundId: integer('round_id').notNull(), // Foreign key to rounds
  participant1Id: text('participant_1_id'), // Can be NULL, participant ID, or "EMPTY_SPOT"
  participant2Id: text('participant_2_id'), // Can be NULL, participant ID, or "EMPTY_SPOT"
  homeResult: integer('home_result').default(0),
  awayResult: integer('away_result').default(0),
  status: text('status').notNull(), // Example: "pending" or "completed"
  matchNumber: integer('match_number').notNull(), // Order of the match in the round
});

export const matchGames = pgTable('match_game', {
  matchGameId: serial('match_game_id').primaryKey(),
  matchId: integer('match_id').notNull(), // Foreign key to matches
  participant1Score: integer('participant_1_score').default(0),
  participant2Score: integer('participant_2_score').default(0),
  gameStatus: text('game_status').notNull() // Example: "in_progress" or "finished"
});



export type SelectTournament =  typeof tournaments.$inferSelect
export const insertTournamentSchema = createInsertSchema(tournaments);

export async function getTournament(
  search: string,
  offset: number
): Promise<{
  tournaments: SelectTournament[];
  newOffset: number | null;
  totalTournaments: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      tournaments: await db
        .select()
        .from(tournaments)
        .where(ilike(tournaments.tournamentName, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalTournaments: 0
    };
  }

  if (offset === null) {
    return { tournaments: [], newOffset: null, totalTournaments: 0 };
  }

  let totalTournaments = await db.select({ count: count() }).from(tournaments);
  let moreTournaments = await db.select().from(tournaments).limit(5).offset(offset);
  let newOffset = moreTournaments.length >= 5 ? offset + 5 : null;

  return {
    tournaments: moreTournaments,
    newOffset,
    totalTournaments: totalTournaments[0].count
  };
}

export async function getParticipantCountByTournamentId(tournamentId: number) {
  try {
    // Query para contar los participantes utilizando SQL raw
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(participants)
      .where(eq(participants.tournamentId, tournamentId));

    return count; // Retornamos el número directamente
  } catch (error) {
    console.error('Error fetching participant count:', error);
    throw error;
  }
}

export async function deleteTournamentById(id: number) {
  await db.delete(tournaments).where(eq(tournaments.tournamentId, id));
}

// Función para insertar un nuevo torneo validando primero los datos
export async function insertTournament(
  tournamentCode: string, //DONE: Este valor debería generarse automaticamente como un UUID de 8 caracteres, implementar en un util
  tournamentName: string,
  status: "Soon" | "In Progress" | "Finished", // Los valores definidos en statusEnum FIXME: Este valor debería fijarse por defecto como proximamente, salvo que se especifique lo contrario
  startDate: Date, 
  endDate: Date,
  nMaxParticipants: number,
  tags: string,
  userMail: string
) {
  // Primero validas los datos con el esquema
  const validatedData = insertTournamentSchema.parse({
    tournamentCode,
    tournamentName,
    status,
    startDate,
    endDate,
    nMaxParticipants,
    tags,
    userMail
  });

  // Si la validación es exitosa, haces el insert en la base de datos
  
  try {
    await db.insert(tournaments).values({
      tournamentCode: validatedData.tournamentCode, // Usa los datos validados
      tournamentName: validatedData.tournamentName,
      status: validatedData.status,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      nMaxParticipants: validatedData.nMaxParticipants,
      tags: validatedData.tags,
      userMail: validatedData.userMail
    });
    console.log(`Torneo ${tournamentName} insertado con éxito`);
  } catch (error) {
    console.error("Error al insertar torneo:", error);
    throw error;
  }
}

export async function getTournamentByCode(tournamentCode: string) {
  try {
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.tournamentCode, tournamentCode))
      .limit(1);

    return tournament.length > 0 ? tournament[0]: null;
  } catch (error) {
    console.error("Error al obtener ID de torneo por código:", error);
    throw error;
  }
}

// Actualizar estado del torneo
export async function updateTournamentStatus(tournamentId: number, status: "Soon" | "In Progress" | "Finished") {
  try {
    await db
      .update(tournaments)
      .set({ status })
      .where(eq(tournaments.tournamentId, tournamentId));

    console.log(`Estado del torneo ${tournamentId} actualizado a ${status}`);
  } catch (error) {
    console.error("Error al actualizar estado de torneo:", error);
    throw error;
  }
}

// Seleccionar los ids de los participantes de un torneo
export async function getParticipantsByTournamentId(tournamentId: number) {
  try {
    const participants_ids = await db
      .select({ participantId: participants.participantId })
      .from(participants)
      .where(eq(participants.tournamentId, tournamentId));

    return participants_ids;
  } catch (error) {
    console.error("Error al obtener participantes por ID de torneo:", error);
    throw error;
  }
}

// Seleccionar los participantes de un torneo
export async function getAllParticipantsByTournamentId(tournamentId: number) {
  try {
    const all_participants = await db
      .select()
      .from(participants)
      .where(eq(participants.tournamentId, tournamentId));
    return all_participants;
  } catch (error) {
    console.error("Error al obtener participantes por ID de torneo:", error);
    throw error;
  }
}

// obtener un participante por su id
export async function getParticipantById(participantId: number) {
  try {
    const participant = await db
      .select()
      .from(participants)
      .where(eq(participants.participantId, participantId))
      .limit(1);

    return participant.length > 0 ? participant[0] : null;
  } catch (error) {
    console.error("Error al obtener participante por ID:", error);
    throw error;
  }
}

/**
 * Fetch the tournamentId based on the provided tournamentCode.
 * @param tournamentCode The unique code for the tournament.
 * @returns The tournamentId if found; otherwise, null.
 */
export async function getTournamentIdByCode(tournamentCode: string): Promise<number | null> {
  try {
    const result = await db
      .select({ tournamentId: tournaments.tournamentId })
      .from(tournaments)
      .where(eq(tournaments.tournamentCode, tournamentCode))
      .limit(1);

    return result.length > 0 ? result[0].tournamentId : null;
  } catch (error) {
    console.error('Error fetching tournamentId by code:', error);
    throw error;
  }
}


export async function getTournamentNameByCode(tournamentCode: string) {
  try {
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.tournamentCode, tournamentCode))
      .limit(1);

    return tournament.length > 0 ? tournament[0].tournamentName : null;
  } catch (error) {
    console.error("Error al obtener nombre de torneo por código:", error);
    throw error;
  }
}

// Insert a group
export async function insertGroup(tournamentId: number, groupNumber: number) {
  try {
    await db.insert(tournamentGroups).values({ tournamentId, groupNumber });
    console.log(`Group ${groupNumber} for tournament ${tournamentId} inserted successfully`);
  } catch (error) {
    console.error("Error inserting group:", error);
    throw error;
  }
}

// Fetch all groups for a specific tournament
export async function getGroupsByTournamentId(tournamentId: number) {
  try {
    const groupsResult = await db
      .select()
      .from(tournamentGroups)
      .where(eq(tournamentGroups.tournamentId, tournamentId));

    return groupsResult;
  } catch (error) {
    console.error("Error fetching groups by tournament ID:", error);
    throw error;
  }
}

// Insert a round
export async function insertRound(groupId: number, roundNumber: number) {
  try {
    await db.insert(rounds).values({ groupId, roundNumber });
    console.log(`Round ${roundNumber} for group ${groupId} inserted successfully`);
  } catch (error) {
    console.error("Error inserting round:", error);
    throw error;
  }
}

// Fetch all rounds for a specific group
export async function getRoundsByGroupId(groupId: number) {
  try {
    const roundsResult = await db
      .select()
      .from(rounds)
      .where(eq(rounds.groupId, groupId));

    return roundsResult;
  } catch (error) {
    console.error("Error fetching rounds by group ID:", error);
    throw error;
  }
}

// Insert a match
export async function insertMatch(roundId: number, participant1Id: string | null, participant2Id: string | null, matchNumber: number) {
  try {
    await db.insert(matchBracket).values({ roundId, participant1Id, participant2Id, status: "pending", matchNumber, homeResult: 0, awayResult: 0 });
    console.log(`Match ${matchNumber} for round ${roundId} inserted successfully`);
  } catch (error) {
    console.error("Error inserting match:", error);
    throw error;
  }
}

// Fetch all matches for a specific round
export async function getMatchesByRoundId(roundId: number) {
  try {
    const matchesResult = await db
      .select()
      .from(matchBracket)
      .where(eq(matchBracket.roundId, roundId));

    return matchesResult;
  } catch (error) {
    console.error("Error fetching matches by round ID:", error);
    throw error;
  }
}
export async function getMatchByRoundIdAndMatchNumber(roundId: number, matchNumber: number) {
  try {
    const matchResult = await db
      .select()
      .from(matchBracket)
      .where(eq(matchBracket.roundId, roundId) && eq(matchBracket.matchNumber, matchNumber));

    return matchResult;
  } catch (error) {
    console.error("Error fetching matches by round ID:", error);
    throw error;
  }
}

// Update match results (home_result, away_result) for a specific match_id
export async function updateMatchResults(matchId: number, homeResult: number, awayResult: number) {
  try {
    const updatedMatch = await db
      .update(matchBracket)
      .set({
        homeResult: homeResult,  // Update the home_result column
        awayResult: awayResult,  // Update the away_result column
      })
      .where(eq(matchBracket.matchId, matchId));  // Specify the match_id to find the match

    return updatedMatch;
  } catch (error) {
    console.error("Error updating match results:", error);
    throw error;
  }
}

export async function updateNextMatch(matchId: number, participant1Id: string| null, participant2Id: string| null) {
  try {
    const updatedMatch = await db
      .update(matchBracket)
      .set({
        participant1Id: participant1Id,  
        participant2Id: participant2Id,  
      })
      .where(eq(matchBracket.matchId, matchId)); 

    return updatedMatch;
  } catch (error) {
    console.error("Error updating match results:", error);
    throw error;
  }
}



// Insert a match game
export async function insertMatchGame(matchId: number, participant1Score: number, participant2Score: number, gameStatus: string) {
  try {
    await db.insert(matchGames).values({ matchId, participant1Score, participant2Score, gameStatus });
    console.log(`Match game for match ${matchId} inserted successfully`);
  } catch (error) {
    console.error("Error inserting match game:", error);
    throw error;
  }
}

// Fetch all match games for a specific match
export async function getMatchGamesByMatchId(matchId: number) {
  try {
    const matchGamesResult = await db
      .select()
      .from(matchGames)
      .where(eq(matchGames.matchId, matchId));

    return matchGamesResult;

  } catch (error) {
    console.error("Error fetching match games by match ID:", error);
    throw error;
  }
}

const dbFunctions = {
  insertUser,
  userExists,
  getUserByEmail,
  deactivateUser,
  getTournamentsByUser,
  insertTournament,
  getTournament,
  updateTournamentStatus,
  getParticipantsByTournamentId,
  getAllParticipantsByTournamentId,
  getParticipantById,
  getTournamentIdByCode,
  getTournamentNameByCode,
  insertGroup,
  getGroupsByTournamentId,
  insertRound,
  getRoundsByGroupId,
  insertMatch,
  getMatchesByRoundId,
  getMatchByRoundIdAndMatchNumber,
  updateMatchResults,
  updateNextMatch,
  insertMatchGame,
  getMatchGamesByMatchId,
  deleteTournamentById,
  getParticipantCountByTournamentId
};

export default dbFunctions;
