import { NextRequest, NextResponse } from "next/server";
import { db, participants, getTournamentByCode, getParticipantCountByTournamentId } from "@/lib/db"; // Importamos el nuevo método
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { tournamentId, participantName } = await req.json();

    if (!tournamentId || !participantName) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const tournamentFromCode = await getTournamentByCode(tournamentId);

    if (!tournamentFromCode) {
      return NextResponse.json(
        { error: "The tournament code is invalid or does not exist." },
        { status: 400 }
      );
    }

    const tournamentIdFromCode = tournamentFromCode.tournamentId;

    if (!tournamentIdFromCode) {
      return NextResponse.json(
        { error: "The tournament code is invalid or does not exist." },
        { status: 400 }
      );
    }

    // Obtenemos la cantidad actual de participantes
    const currentParticipantCount = await getParticipantCountByTournamentId(tournamentIdFromCode);

    // Verificamos si el límite se ha alcanzado
    if (currentParticipantCount >= tournamentFromCode.nMaxParticipants) {
      return NextResponse.json(
        { error: "The tournament has reached the maximum number of participants." },
        { status: 403 }
      );
    }

    // Insertamos el nuevo participante
    const result = await db.insert(participants).values({
      tournamentId: tournamentIdFromCode,
      participantName,
    });

    if (result) {
      return NextResponse.json(
        { message: "Participant successfully registered." },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Error registering participant. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al insertar el participante:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
