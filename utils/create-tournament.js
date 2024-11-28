import { insertGroup, insertRound, insertMatch, getGroupsByTournamentId, getRoundsByGroupId } from "@/lib/db";

export const createTournamentBracket = async (tournamentData) => {
  const EMPTY_SPOT = "EMPTY_SPOT";
  const participants = tournamentData.participants;

  const totalParticipants = participants.length;
  const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(totalParticipants));
  const byesNeeded = nextPowerOfTwo - totalParticipants;

  const activeParticipants = [...participants];
  for (let i = 0; i < byesNeeded; i++) {
    activeParticipants.push(null);
  }

  const hasExcessiveConsecutiveByes = (participants, maxByes = 2) => {
    let byeCount = 0;
    for (const participant of participants) {
      if (participant === null) byeCount++;
      else byeCount = 0;
      if (byeCount > maxByes) return true;
    }
    return false;
  };

  do {
    activeParticipants.sort(() => Math.random() - 0.5);
  } while (hasExcessiveConsecutiveByes(activeParticipants));

  await insertGroup(tournamentData.tournamentId, 1);

  const groups = await getGroupsByTournamentId(tournamentData.tournamentId);
  if (groups.length === 0) {
    throw new Error("Failed to retrieve group after insertion.");
  }
  const groupId = groups[0].groupId;

  const totalRounds = Math.log2(nextPowerOfTwo);
  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    await insertRound(groupId, roundIndex + 1);
  }

  const rounds = await getRoundsByGroupId(groupId);
  if (rounds.length !== totalRounds) {
    throw new Error("Failed to retrieve all rounds after insertion.");
  }

  let matchNumber = 1;
  let previousRoundWinners = activeParticipants;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const roundId = rounds[roundIndex].roundId;
    const currentRoundWinners = [];

    const tempParticipants = [...previousRoundWinners];

    while (tempParticipants.length % 2 !== 0 && tempParticipants.length > 1) {
      const lastParticipant = tempParticipants.pop();
      tempParticipants.push(null);
      if (lastParticipant) {
        tempParticipants.unshift(lastParticipant);
      }
    }

    if (tempParticipants.length % 2 !== 0) {
      tempParticipants.push(null);
    }

    for (let i = 0; i < tempParticipants.length; i += 2) {
      const participant1 = tempParticipants[i];
      const participant2 = tempParticipants[i + 1] || null;

      let winner = null;

      if (participant1 && !participant2) {
        winner = participant1;
      } else if (participant2 && !participant1) {
        winner = participant2;
      }

      await insertMatch(
        roundId,
        participant1 ? participant1.id || EMPTY_SPOT : null,
        participant2 ? participant2.id || EMPTY_SPOT : null,
        matchNumber++
      );

      if (winner) {
        currentRoundWinners.push(winner);
      } else {
        currentRoundWinners.push(EMPTY_SPOT);
      }
    }

    previousRoundWinners = currentRoundWinners.filter((p) => p !== null);
  }

  if (previousRoundWinners.length === 2) {
    await insertMatch(
      rounds[rounds.length - 1].roundId,
      previousRoundWinners[0].id || EMPTY_SPOT,
      previousRoundWinners[1].id || EMPTY_SPOT,
      matchNumber++
    );
  }

  return {
    message: "Tournament structure successfully created",
  };
};
