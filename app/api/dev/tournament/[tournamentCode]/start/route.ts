import { createTournamentBracket } from "utils/create-tournament";
import { getTournamentByCode, getAllParticipantsByTournamentId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { tournamentCode: string } }) {
  try {
    const { tournamentCode } = params;

    // Validate tournament code
    const tournament = await getTournamentByCode(tournamentCode);
    
    if (!tournament) {
        return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });
      }

    // Fetch participants for the tournament
    const participants = await getAllParticipantsByTournamentId(tournament.tournamentId);
    if (participants.length === 0) {
      return NextResponse.json({ error: "No participants found for the tournament." }, { status: 400 });
    }

    // Transform data and create the tournament structure
    const response = await createTournamentBracket({
      tournamentId: tournament.tournamentId,
      tournamentName: tournament.tournamentName,
      participants: participants.map((p) => ({ id: p.participantId, name: p.participantName })),
    });

    return NextResponse.json({ message: "Tournament successfully created.", response });
  } catch (error) {
    console.error("Error starting tournament:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
