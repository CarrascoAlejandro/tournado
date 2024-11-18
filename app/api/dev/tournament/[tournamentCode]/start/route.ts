import { NextRequest, NextResponse } from "next/server";
import { getParticipantsByTournamentId, getTournamentByCode, insertMatchBracket, getMatchBracketsByTournamentId, updateTournamentStatus } from "@/lib/db";
import { getMatchLevel, makePairs } from "@/lib/utils";


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

        // If the tournament has already started, return an error
        if (tournament.status !== "Soon") {
            return NextResponse.json({ error: "Tournament has already started" }, { status: 400 });
        }

        const participants = await getParticipantsByTournamentId(tournament.tournamentId);

        if (!participants || participants.length === 0) {
            return NextResponse.json({ error: "No participants found" }, { status: 404 });
        }

        console.log("participants: ", participants);

        const pairs = makePairs(participants.map((p) => p.participantId));

        let warnings = [];

        if (pairs.length === 0) {
            return NextResponse.json({ error: "No pairs could be created" }, { status: 400 });
        }

        // if there number of participants is not a power of 2, add a warning
        if (Math.log2(participants.length) % 1 !== 0) {
            warnings.push("Number of participants will not make even brackets");
        }

        //For each pair create a match bracket with status "pending"
        for (const pair of pairs) {
            if(pair[0] === undefined && pair[1] !== undefined) {
                warnings.push(`Participant ${pair[1]} has no pair`);
                continue;
            } else if(pair[0] !== undefined && pair[1] === undefined){
                warnings.push(`Participant ${pair[0]} has no pair`);
                continue;
            } else if(pair[0] === undefined && pair[1] === undefined){
                throw new Error("Undefined participants during pairing");
            }

            await insertMatchBracket(
                pair[0],
                pair[1],
                tournament.tournamentId,
                0,
                0,
                "pending",
                getMatchLevel(participants.length)
            )
        }

        // Update the tournament status to "In Progress"
        await updateTournamentStatus(tournament.tournamentId, "In Progress");

        // get the match brackets for the tournament
        const matchBrackets = await getMatchBracketsByTournamentId(tournament.tournamentId);

        return NextResponse.json({ message: "Tournament started successfully", matchBrackets, warnings });
    } catch (error) {
        console.error("Error starting tournament:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

