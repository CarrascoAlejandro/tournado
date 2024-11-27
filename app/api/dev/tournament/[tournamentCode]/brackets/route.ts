import {
    getTournamentByCode,
    getAllParticipantsByTournamentId,
    getGroupsByTournamentId,
    getRoundsByGroupId,
    getMatchesByRoundId,
    getMatchGamesByMatchId,
  } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { tournamentCode: string } }) {
    try {
        const { tournamentCode } = params;

        // Fetch tournament details
        const tournament = await getTournamentByCode(tournamentCode);
        if (!tournament) {
        return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        const tournamentId = tournament.tournamentId;

        // Fetch participants
        const participants = await getAllParticipantsByTournamentId(tournamentId);

        // Fetch groups
        const groups = await getGroupsByTournamentId(tournamentId);
        if (groups.length === 0) {
            return NextResponse.json({ error: "Tournament don't started yet" }, { status: 404 });
        }

        // Build the response
        const response: any = {
        participant: participants.map((participant) => ({
            id: participant.participantId,
            tournament_id: tournamentId,
            name: participant.participantName,
        })),
        stage: [
            {
            id: tournamentId, // Assuming stage ID is the same as the tournament ID
            tournament_id: tournamentId,
            name: tournament.tournamentName,
            type: "single_elimination", // Hardcoded based on your implementation
            settings: {
                size: participants.length,
                seedOrdering: ["natural"],
            },
            number: 1,
            },
        ],
        group: [],
        round: [],
        match: [],
        match_game: [],
        };

        // Fetch data for each group
        for (const group of groups) {
        response.group.push({
            id: group.groupId,
            stage_id: tournamentId,
            number: group.groupNumber,
        });

        const rounds = await getRoundsByGroupId(group.groupId);

        // Fetch data for each round
        for (const round of rounds) {
            response.round.push({
            id: round.roundId,
            stage_id: tournamentId,
            group_id: group.groupId,
            number: round.roundNumber,
            });

            const matches = await getMatchesByRoundId(round.roundId);

            // Fetch data for each match
            for (const match of matches) {
                response.match.push({
                    id: match.matchId,
                    stage_id: tournamentId,
                    group_id: group.groupId,
                    round_id: round.roundId,
                    number: match.matchNumber,
                    child_count: 0, // Assuming no "Best Of" matches unless specified
                    status: match.status,
                    opponent1: match.participant1Id
                      ? match.participant1Id === "EMPTY_SPOT"
                        ? { id: null }
                        : { id: Number(match.participant1Id) }
                      : null,
                    opponent2: match.participant2Id
                      ? match.participant2Id === "EMPTY_SPOT"
                        ? { id: null }
                        : { id: Number(match.participant2Id) }
                      : null,
                  });
                  

            const matchGames = await getMatchGamesByMatchId(match.matchId);

            // Fetch data for each match game
            for (const game of matchGames) {
                response.match_game.push({
                id: game.matchGameId,
                stage_id: tournamentId,
                parent_id: match.matchId,
                number: response.match_game.length + 1,
                participant1Score: game.participant1Score,
                participant2Score: game.participant2Score,
                gameStatus: game.gameStatus,
                });
            }
            }
        }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching tournament data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}