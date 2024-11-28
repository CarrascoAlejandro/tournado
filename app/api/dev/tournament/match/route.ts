import { updateParticipantMatch } from "utils/update-participant-match";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { tournamentId, roundId, previousMatchId, participantId } = await req.json();
    // Call the updated updateParticipantMatch function
    const updatedMatch = await updateParticipantMatch({
      tournamentId: Number(tournamentId) ?? 0,
      roundId: roundId ?? 0,
      previousMatchId: previousMatchId ?? 0,
      participantId: participantId ?? 0,
    });

    if (updatedMatch.message !== "Match updated successfully") {
      return NextResponse.json({ error: updatedMatch.message }, { status: 404 });
    }

    return NextResponse.json({ message: updatedMatch.message, data: updatedMatch.data });
  } catch (error) {
    console.error("Error updating match participant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}