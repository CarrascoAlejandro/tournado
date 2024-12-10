import { NextRequest, NextResponse } from "next/server";
import { db, participants, participantImage, getTournamentByCode, getParticipantCountByTournamentId, getParticipantsByTournamentId } from "@/lib/db"; 
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { tournamentId, participantName, selectedImage } = await req.json();

    
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

    
    const currentParticipantList = await getParticipantsByTournamentId(tournamentIdFromCode);

    
    if (currentParticipantList.length >= tournamentFromCode.nMaxParticipants) {
      return NextResponse.json(
        { error: "The tournament has reached the maximum number of participants." },
        { status: 403 }
      );
    }

    
    for (const participant of currentParticipantList) {
      if (participant.participantName === participantName) {
        return NextResponse.json(
          { error: "A participant with the same name already exists in the tournament." },
          { status: 400 }
        );
      }
    }

    
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
