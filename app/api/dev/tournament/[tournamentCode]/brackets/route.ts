import { NextRequest, NextResponse } from "next/server";
import {
  getTournamentByCode,
  getMatchBracketsByTournamentId,
} from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { tournamentCode: string } }
) {
  try {
    const { tournamentCode } = params;

    if (!tournamentCode) {
      return NextResponse.json(
        { error: "Tournament Code is required" },
        { status: 400 }
      );
    }

    const tournament = await getTournamentByCode(tournamentCode);

    if (!tournament || !tournament.tournamentId) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const matchBrackets = await getMatchBracketsByTournamentId(
      tournament.tournamentId
    );

    return NextResponse.json({
      message: "Tournament data retrieved successfully",
      tournament,
      matchBrackets,
    });
  } catch (error) {
    console.error("Error fetching tournament data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
