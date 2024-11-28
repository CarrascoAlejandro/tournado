import { updateParticipantMatch } from "utils/update-participant-match";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest) {
  try {
    
    const { tournamentId, roundId, previousMatchId, participantId } = await req.json(); // Leer los datos enviados en el cuerpo de la solicitud
    console.log(tournamentId, roundId, previousMatchId, participantId);
    const updatedMatch = await updateParticipantMatch({
        tournamentId: Number(tournamentId) ?? 0,
        roundId: roundId ?? 0,
        previousMatchId: previousMatchId ?? 0,
        participantId: participantId ?? 0,
      });

    
    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Retornar la respuesta con el partido actualizado
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match participant id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
