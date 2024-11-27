import { createMatchBracket, getMatchBracketsByTournamentId, getTournamentByCode, updateScoresByBracketId, getParticipantsWithoutMatchBracket, getTournamentIdByCode, getTournamentNameByCode } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { CreateBracketInput, UpdateBracketInput } from "types/bracketInput";

export async function GET(req: NextRequest, { params }: { params: { tournamentCode: string } }) {
    try {
      const { tournamentCode } = params;
  
      if (!tournamentCode) {
        return NextResponse.json({ error: 'Tournament Code is required' }, { status: 400 });
      }
  
      const tournamentId = await getTournamentIdByCode(tournamentCode);
  
      if (!tournamentId) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
  
      const brackets = await getMatchBracketsByTournamentId(tournamentId);
  
      if (!brackets || brackets.length === 0) {
        return NextResponse.json({ error: 'No brackets found' }, { status: 404 });
      }
  
      const byes = await getParticipantsWithoutMatchBracket(tournamentId);
      
      const tournamentName = await getTournamentNameByCode(tournamentCode);

      if (!tournamentName) {
        return NextResponse.json({ error: 'Tournament name not found' }, { status: 404 });
      }

      return NextResponse.json({ brackets, byes, tournamentId, tournamentName }, { status: 200 });
    } catch (error) {
      console.error('Error getting brackets:', error);
      return NextResponse.json(
        { error: 'Internal Server Error. Please try again later.' },
        { status: 500 }
      );
    }
}
  

export async function POST(req: NextRequest, { params }: { params: { tournamentCode: string } }) {
    try {
        const { tournamentCode } = params;

        console.log("tournamentCode: ", tournamentCode);

        if (!tournamentCode) {
            return NextResponse.json({ error: "Tournament Code is required" }, { status: 400 });
        }

        const tournament = await getTournamentByCode(tournamentCode);

        if (!tournament || !tournament.tournamentId) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        console.log("tournament details: ", tournament);

        const { participant1Id, participant2Id, level } : CreateBracketInput = await req.json();

        console.log("body: ", { participant1Id, participant2Id, level });

        if (!participant1Id || !participant2Id || !level) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Create bracket
        const bracket = await createMatchBracket(
            participant1Id,
            participant2Id,
            tournament.tournamentId,
            0,
            0,
            "pending",
            level,
        )

        console.log("bracket: ", bracket);

        return NextResponse.json({ bracket }, { status: 200 });
    } catch (error) {
        console.error("Error creating bracket:", error);
        return NextResponse.json(
            { error: "Internal Server Error. Please try again later." },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: { tournamentCode: string }} ) {
    try {
        const { tournamentCode } = params;

        console.log("tournamentCode: ", tournamentCode);

        if (!tournamentCode) {
            return NextResponse.json({ error: "Tournament Code is required" }, { status: 400 });
        }

        const tournament = await getTournamentByCode(tournamentCode);

        if (!tournament || !tournament.tournamentId) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        console.log("tournament details: ", tournament);

        const { bracketId, awayScore, homeScore, status } : UpdateBracketInput = await req.json()

        console.log("body: ", { bracketId, awayScore, homeScore, status });

        if (bracketId == null || awayScore == null || homeScore == null || status == null) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Update bracket
        const bracket = await updateScoresByBracketId(
            bracketId,
            homeScore,
            awayScore,
            status
        )

        console.log("bracket: ", bracket);

        return NextResponse.json({ bracket }, { status: 200 });
    } catch (error) {
        console.error("Error updating bracket:", error);
        return NextResponse.json(
            { error: "Internal Server Error. Please try again later." },
            { status: 500 }
        );
    }
} 