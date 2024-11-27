export const transformDataForBracketsViewer = (tournamentData: {
    brackets: Array<{
      matchBracketId: number;
      participant1Id: number | null;
      participant2Id: number | null;
      status: string; // "pending" or "completed"
      level: string;
    }>;
    byes: Array<{ participantId: number }>;
    tournamentId: number;
    tournamentName: string;
  }) => {
    let currentId = 0;
  
    // Generate unique IDs
    const generateId = () => currentId++;
  
    // Extract participants
    const allParticipants = [
      ...tournamentData.brackets
        .flatMap((bracket) => [bracket.participant1Id, bracket.participant2Id])
        .filter((id) => id !== null),
      ...tournamentData.byes.map((bye) => bye.participantId),
    ];
    const participants = Array.from(new Set(allParticipants)).map((id) => ({
      id: id!,
      tournament_id: tournamentData.tournamentId,
      name: `Team ${id}`,
    }));
  
    // Total number of participants
    const totalParticipants = participants.length;
  
    // Calculate the next power of two
    const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(totalParticipants));
  
    // Calculate the number of byes needed
    const byesNeeded = nextPowerOfTwo - totalParticipants;
  
    // Generate stage and group IDs
    const stageId = generateId();
    const groupId = generateId();
  
    // Create rounds dynamically
    const totalRounds = Math.log2(nextPowerOfTwo);
    const rounds: Array<any> = [];
    const levelToRoundMap: Record<string, number> = {};
  
    for (let i = 0; i < totalRounds; i++) {
      const roundId = generateId();
      rounds.push({
        id: roundId,
        number: i + 1,
        stage_id: stageId,
        group_id: groupId,
      });
      levelToRoundMap[`round_${i + 1}`] = roundId;
    }
  
    const matches: Array<any> = [];
    const activeParticipants = [...participants]; // Clone the participant array for mutation
  
    // Assign byes in the first round
    for (let i = 0; i < byesNeeded; i++) {
      activeParticipants.push(null); // Fill the rest with empty slots (byes)
    }
  
    // Shuffle participants to distribute byes evenly
    activeParticipants.sort(() => Math.random() - 0.5);
  
    // Create matches for all rounds
    let matchNumber = 1;
    let previousRoundWinners = activeParticipants; // Start with all participants
  
    // Updated logic for assigning byes and generating matches
    for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
        const roundId = levelToRoundMap[`round_${roundIndex + 1}`];
        const currentRoundWinners = []; // Track winners for the next round

        // Ensure an even number of participants for the round
        const tempParticipants = [...previousRoundWinners];

        // Pair all available participants first
        while (tempParticipants.length % 2 !== 0 && tempParticipants.length > 1) {
            const lastParticipant = tempParticipants.pop(); // Remove last participant temporarily
            tempParticipants.push(null); // Add a BYE in its place
            tempParticipants.unshift(lastParticipant); // Add it back to ensure pairing
        }

        // Distribute BYEs only if no participants are left to pair
        if (tempParticipants.length % 2 !== 0) {
            tempParticipants.push(null); // Add a single BYE if necessary
        }

        for (let i = 0; i < tempParticipants.length; i += 2) {
            const opponent1 = tempParticipants[i];
            const opponent2 = tempParticipants[i + 1];

            let winner = null;

            if (opponent1 && !opponent2) {
                winner = opponent1; // Bye for opponent1
            } else if (!opponent1 && opponent2) {
                winner = opponent2; // Bye for opponent2
            }

            matches.push({
                id: generateId(),
                number: matchNumber++,
                stage_id: stageId,
                group_id: groupId,
                round_id: roundId,
                child_count: 0,
                status: 0, // Pending
                opponent1: opponent1 ? { id: opponent1.id } : null,
                opponent2: opponent2 ? { id: opponent2.id } : null,
            });

            if (winner) {
                currentRoundWinners.push(winner);
            } else {
                // Placeholder for unresolved matches
                currentRoundWinners.push({ id: null });
            }
        }

        // Filter out nulls for the next round
        previousRoundWinners = currentRoundWinners.filter((p) => p !== null);
    }
  
    // Add the final match
    if (previousRoundWinners.length === 2) {
      matches.push({
        id: generateId(),
        number: matchNumber,
        stage_id: stageId,
        group_id: groupId,
        round_id: levelToRoundMap[`round_${totalRounds}`],
        child_count: 0,
        status: 0, // Pending
        opponent1: previousRoundWinners[0] ? { id: previousRoundWinners[0].id } : { id: null },
        opponent2: previousRoundWinners[1] ? { id: previousRoundWinners[1].id } : { id: null },
      });
    }
  
    // Construct the stage
    const stage = {
      id: stageId,
      tournament_id: tournamentData.tournamentId,
      name: tournamentData.tournamentName,
      type: "single_elimination",
      number: 1,
      settings: {
        size: nextPowerOfTwo,
        seedOrdering: ["natural"],
        matchesChildCount: 0,
      },
    };
  
    // Construct the group
    const group = {
      id: groupId,
      stage_id: stageId,
      number: 1,
    };
  
    // Return the transformed data
    return {
      participant: participants,
      stage: [stage],
      group: [group],
      round: rounds,
      match: matches,
      match_game: [],
    };
  };
  