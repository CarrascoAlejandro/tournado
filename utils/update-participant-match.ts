import { 
  getAllParticipantsByTournamentId, 
  getGroupsByTournamentId, 
  getRoundsByGroupId, 
  getMatchesByRoundId, 
  getMatchByRoundIdAndMatchNumber,
  updateNextMatch,
} from "@/lib/db";

export const updateParticipantMatch = async (tournamentData: {
  tournamentId: number;
  roundId: number;
  previousMatchId: number;
  participantId: number;
}) => {
  try {
    if (tournamentData.tournamentId === 0 || tournamentData.participantId === 0) {
      return { message: "Tournament not ready" };
    }

    const totalParticipants = await getAllParticipantsByTournamentId(tournamentData.tournamentId);
    const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(totalParticipants.length));
    const totalInitialRounds = nextPowerOfTwo / 2;

    const groupId = await getGroupsByTournamentId(tournamentData.tournamentId);
    const rounds = await getRoundsByGroupId(groupId[0].groupId);
    const sortedRounds = rounds.sort((a, b) => a.roundNumber - b.roundNumber);

    const currentRoundIndex = sortedRounds.findIndex(round => round.roundId === tournamentData.roundId);
    if (currentRoundIndex === -1) throw new Error("Current round not found");

    const nextRound = sortedRounds[currentRoundIndex + 1];
    if (!nextRound) {
      return { message: "No next round found" };
    }

    const matches = await getMatchesByRoundId(tournamentData.roundId);
    const currentMatch = matches.find(match => match.matchId === tournamentData.previousMatchId);
    if (!currentMatch) throw new Error("Current match not found");

    // Calculate the next match number correctly
    const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2) + totalInitialRounds;
    const nextMatch = await getMatchByRoundIdAndMatchNumber(nextRound.roundId, nextMatchNumber);

    if (!nextMatch || nextMatch.length === 0) {
      return { message: "No next match found" + nextMatchNumber };
    }

    let participant1Id = nextMatch[0].participant1Id;
    let participant2Id = nextMatch[0].participant2Id;
    const participantIdStr = tournamentData.participantId.toString();

    // Update the next match with the winner
    if (participant1Id === 'EMPTY_SPOT' && participant2Id === 'EMPTY_SPOT' || participant1Id === "undefined" && participant2Id === "undefined") {
      participant1Id = participantIdStr;
    } else if (participant1Id === 'EMPTY_SPOT' || participant1Id === "undefined") {
      participant1Id = participantIdStr;
    } else if (participant2Id === 'EMPTY_SPOT' || participant2Id === "undefined") {
      participant2Id = participantIdStr;
    }

    const updateData = {
      matchId: nextMatch[0].matchId,
      participant1Id: participant1Id,
      participant2Id: participant2Id,
    };

    await updateNextMatch(updateData.matchId, updateData.participant1Id, updateData.participant2Id);
    return { message: "Match updated successfully", data: updateData };
  } catch (error: any) {
    return { message: `Error: ${error.message}` };
  }
};