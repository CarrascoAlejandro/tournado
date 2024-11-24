import { NextRequest, NextResponse } from "next/server";
import { db, participants, getTournamentIdByCode } from "@/lib/db"; // Importa la conexión y la tabla desde db.ts
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try { // TODO: Esto debería estar en tournament/[tournamentCode]/join
    const { tournamentId, participantName } = await req.json();

    if (!tournamentId || !participantName) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    const tournamentIdFromCode = await getTournamentIdByCode(tournamentId);

    if (!tournamentIdFromCode) {
      return NextResponse.json(
        { error: "El código de torneo no es válido o no existe" },
        { status: 400 }
      );
    }

    const result = await db.insert(participants).values({
      tournamentId: tournamentIdFromCode, // Usamos la columna correcta "tournamentId"
      participantName,
    });

    if (result) {
      return NextResponse.json(
        { message: "Participante registrado con éxito" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Error al registrar el participante. Por favor, inténtalo de nuevo más tarde." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al insertar el participante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, intenta más tarde." },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true, // Deja el cuerpo parseado por defecto para recibir json
  },
};
