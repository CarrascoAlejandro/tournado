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
import { count, eq, ilike } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

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

export const matchBrackets = pgTable('match_bracket', {
  matchBracketId: serial('match_bracket_id').primaryKey(),
  participant1Id: integer('participant_1_id').notNull(),
  participant2Id: integer('participant_2_id').notNull(),
  tournamentId: integer('tournament_id').notNull(),
  homeResult: integer('home_result').notNull(),
  awayResult: integer('away_result').notNull(),
  status: text('status').notNull(),
  level: text('level').notNull()
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

export async function getTournamentIdByCode(tournamentCode: string) {
  try {
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.tournamentCode, tournamentCode))
      .limit(1);

    return tournament.length > 0 ? tournament[0].tournamentId : null;
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

// Insertar un nuevo match bracket
export async function insertMatchBracket(
  participant1Id: number,
  participant2Id: number,
  tournamentId: number,
  homeResult: number,
  awayResult: number,
  status: string,
  level: string
) {
  try {
    await db.insert(matchBrackets).values({
      participant1Id,
      participant2Id,
      tournamentId,
      homeResult,
      awayResult,
      status,
      level
    });
    console.log(`Match bracket insertado con éxito`);
  } catch (error) {
    console.error("Error al insertar match bracket:", error);
    throw error;
  }
}

// Seleccionar los match brackets de un torneo, ordenados por nivel
export async function getMatchBracketsByTournamentId(tournamentId: number) {
  try {
    const matchBracketsResult = await db
      .select()
      .from(matchBrackets)
      .where(eq(matchBrackets.tournamentId, tournamentId))
      .orderBy(matchBrackets.level);

    return matchBracketsResult;
  } catch (error) {
    console.error("Error al obtener match brackets por ID de torneo:", error);
    throw error;
  }
}
