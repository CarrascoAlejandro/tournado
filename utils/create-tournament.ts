import { insertGroup, insertRound, insertMatch, getGroupsByTournamentId, getRoundsByGroupId } from "@/lib/db";

export const createTournamentBracket = async (tournamentData: {
  tournamentId: number;
  tournamentName: string;
  participants: Array<{ id: number; name: string } | null> ;
}) => {
  const EMPTY_SPOT = "EMPTY_SPOT"; // Placeholder for matches with unresolved participants
  const participants = tournamentData.participants;

  // Total number of participants
  const totalParticipants = participants.length;

  // Calculate the next power of two
  const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(totalParticipants));

  // Calculate the number of byes needed
  const byesNeeded = nextPowerOfTwo - totalParticipants;

  // Add BYEs to participants
  const activeParticipants = [...participants];
  /* for (let i = 0; i < byesNeeded; i++) {
    activeParticipants.push(null); // Represent BYEs as `null`
  }*/

  // Ensure no excessive consecutive BYEs
  const hasExcessiveConsecutiveByes = (participants: Array<any>, maxByes = 2) => {
    for (let i = 0; i < participants.length; i++) {
      if (participants[i] !== null) {
        let byeCount = 0;
        // Verificar hacia adelante
        for (let j = i + 1; j < participants.length && participants[j] === null; j++) {
          byeCount++;
        }
        // Verificar hacia atrás
        for (let j = i - 1; j >= 0 && participants[j] === null; j--) {
          byeCount++;
        }
        if (byeCount > maxByes) return true;
      }
    }
    return false;
  };

  const shuffleArray = (array: Array<any>) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  /* const ensureNoExcessiveConsecutiveByes = (participants: Array<any>, maxByes = 1) => {
    let shuffledParticipants = [...participants];
    while (hasExcessiveConsecutiveByes(shuffledParticipants, maxByes)) {
      console.log("Participants list: ", shuffledParticipants);
      shuffledParticipants = shuffleArray(shuffledParticipants);
    }
    console.log("Final participants list: ", shuffledParticipants);
    return shuffledParticipants;
  }; */

  const ensureNoExcessiveConsecutiveByes = (participants: Array<any>, byesNeeded = 0) => {
      // Shuffle participants
      let tempShuffledParticipants = shuffleArray([...participants]);
  
      //Starting from the end, interleave BYEs (nulls) until the desired number is reached
      // For example: [1, 2, 3, 4, 5] with 3 BYEs -> [1, 2, 3, null, 4, null, 5, null]
      let i = tempShuffledParticipants.length ;
      while (byesNeeded > 0) {
        tempShuffledParticipants.splice(i, 0, null);
        byesNeeded--;
        i -= 1;
      }
  
      console.log("Final participants list: ");
      for(let i = 0; i < tempShuffledParticipants.length; i+=2) {
          console.log(`${tempShuffledParticipants[i]} vs ${tempShuffledParticipants[i+1]}`);
      }
      return tempShuffledParticipants;
    }

  // Shuffle participants to ensure no excessive consecutive BYEs
  const shuffledParticipants = ensureNoExcessiveConsecutiveByes(activeParticipants, byesNeeded);

  // Insert the group
  await insertGroup(tournamentData.tournamentId, 1); // Single group (number 1)

  // Get the group ID
  const groups = await getGroupsByTournamentId(tournamentData.tournamentId);
  if (groups.length === 0) {
    throw new Error("Failed to retrieve group after insertion.");
  }
  const groupId = groups[0].groupId;

  // Determine rounds
  const totalRounds = Math.log2(nextPowerOfTwo);
  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    await insertRound(groupId, roundIndex + 1);
  }

  // Retrieve round IDs
  const rounds = await getRoundsByGroupId(groupId);
  if (rounds.length !== totalRounds) {
    throw new Error("Failed to retrieve all rounds after insertion.");
  }

  // Create matches for all rounds
  let matchNumber = 1;
  let previousRoundWinners = shuffledParticipants; // Start with all participants

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const roundId = rounds[roundIndex].roundId;
    const currentRoundWinners: Array<any> = [];

    // Ensure an even number of participants for the round
    const tempParticipants = [...previousRoundWinners];

    while (tempParticipants.length % 2 !== 0 && tempParticipants.length > 1) {
      const lastParticipant = tempParticipants.pop(); // Temporarily remove the last participant
      tempParticipants.push(null); // Add a BYE in its place
      if (lastParticipant) {
        tempParticipants.unshift(lastParticipant); // Add the participant back
      }
    }

    // Add a BYE if still unbalanced
    if (tempParticipants.length % 2 !== 0) {
      tempParticipants.push(null);
    }

    // Create matches and determine winners
    for (let i = 0; i < tempParticipants.length; i += 2) {
      const participant1 = tempParticipants[i];
      const participant2 = tempParticipants[i + 1] ?? null;

      // Determine the winner
      let winner = null;

      if (participant1 && !participant2) {
        winner = participant1; // BYE for participant1
      } else if (participant2 && !participant1) {
        winner = participant2; // BYE for participant2
      } 

      // Insert the match
      await insertMatch(
        roundId,
        participant1 ? String(participant1.id) ?? EMPTY_SPOT : null,
        participant2 ? String(participant2.id) ?? EMPTY_SPOT : null,
        matchNumber++
      );

      if (winner) {
        currentRoundWinners.push(winner);
      } else {
        currentRoundWinners.push(EMPTY_SPOT);
      }
    }

    // Prepare for the next round
    previousRoundWinners = currentRoundWinners.filter((p) => p !== null);
  }

  if (previousRoundWinners.length === 2) {
    // Insert the final match
    await insertMatch(
      rounds[rounds.length - 1].roundId,
      previousRoundWinners[0] ? String(previousRoundWinners[0].id) : EMPTY_SPOT,
      previousRoundWinners[1] ? String(previousRoundWinners[1].id) : EMPTY_SPOT,
      matchNumber++
    );
  }
  return {
    message: "Tournament structure successfully created",
  };
};