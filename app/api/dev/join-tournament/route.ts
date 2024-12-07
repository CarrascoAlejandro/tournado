import { NextRequest, NextResponse } from "next/server";
import { db, participants, participantImage, getTournamentByCode, getParticipantCountByTournamentId, getParticipantsByTournamentId } from "@/lib/db"; // Importamos la tabla de imágenes
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { tournamentId, participantName, selectedImage } = await req.json();

    // Validar la existencia del torneo
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

    // Obtenemos la lista actual de participantes
    const currentParticipantList = await getParticipantsByTournamentId(tournamentIdFromCode);

    // Validar el límite de participantes
    if (currentParticipantList.length >= tournamentFromCode.nMaxParticipants) {
      return NextResponse.json(
        { error: "The tournament has reached the maximum number of participants." },
        { status: 403 }
      );
    }

    // Verificar si existe un participante con el mismo nombre
    for (const participant of currentParticipantList) {
      if (participant.participantName === participantName) {
        return NextResponse.json(
          { error: "A participant with the same name already exists in the tournament." },
          { status: 400 }
        );
      }
    }

    // Insertar el participante
    const participantResult = await db.insert(participants).values({
      tournamentId: tournamentIdFromCode,
      participantName,
    }).returning({ id: participants.participantId });

    if (!participantResult || participantResult.length === 0) {
      return NextResponse.json(
        { error: "Error registering participant. Please try again later." },
        { status: 500 }
      );
    }

    const participantId = participantResult[0].id;

    // Insertar la imagen del participante en la tabla correspondiente
    if (selectedImage) {
      await db.insert(participantImage).values({
        participantId: participantId,
        imageId: selectedImage,
      });
    }

    return NextResponse.json(
      { message: "Participant and image successfully registered." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inserting the participant or image:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
