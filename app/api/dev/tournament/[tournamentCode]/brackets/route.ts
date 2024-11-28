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
        console.log("en GET de brackets/route.ts");
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
            id: participant.participantId!= null ? participant.participantId : null,
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
                    number: match.matchNumber,
                    stage_id: tournamentId,
                    group_id: group.groupId,
                    round_id: round.roundId,
                    child_count: 0, // Assuming no "Best Of" matches unless specified
                    status: 4,
                    opponent1: match.participant1Id
                            ? match.participant1Id === "EMPTY_SPOT"
                                ? { id: null, score: "-", result: "draw" }
                                : {
                                    id: Number(match.participant1Id),
                                    score: match.homeResult == 0 || match.homeResult == null ? "-" : match.homeResult,
                                    // result: match.homeResult == null || match.awayResult == null
                                    //     ? "draw"
                                    //     : match.homeResult > match.awayResult
                                    //         ? "win"
                                    //         : "loss"
                                }
                            : null,

                        opponent2: match.participant2Id
                            ? match.participant2Id === "EMPTY_SPOT"
                                ? { id: null, score: "-", result: "draw" }
                                : {
                                    id: Number(match.participant2Id),
                                    score: match.awayResult == 0 || match.awayResult == null ? "-" : match.awayResult,
                                    // result: match.homeResult == null || match.awayResult == null
                                    //     ? "draw"
                                    //     : match.awayResult > match.homeResult
                                    //         ? "win"
                                    //         : "loss"
                                }
                            : null

                });
            console.log("match before fetch: ", match);
            const matchGames = await getMatchGamesByMatchId(match.matchId);
            console.log("match games after fetch: " + matchGames);
            // Fetch data for each match game
            for (const game of matchGames) {
                response.match_game.push({
                id: game.matchGameId,
                stage_id: tournamentId,
                parent_id: match.matchId,
                number: response.match_game.length + 1
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