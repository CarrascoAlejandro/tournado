import { //getParticipantCountByTournamentId,
        getAllParticipantsByTournamentId,
        // getGroupsByTournamentId,
        // getRoundsByGroupId,
        // getMatchesByRoundId,
        // getMatchByRoundIdAndMatchNumber
        } from "@/lib/db";

export const updateParticipantMatch = async (tournamentData: {
    tournamentId: number;
    roundId: number;
    previousMatchId: number;
    participantId: number;
}) => {

    console.log("tournamet_data: ",tournamentData);
    if(tournamentData.tournamentId== 0)
    {
      return {
        message: "Tournament not ready",
      };
    }
    try{
    // Total number of participants
    const totalParticipants = await getAllParticipantsByTournamentId(tournamentData.tournamentId);
    console.log("totalParticipants: ",totalParticipants);
    // Calculate the next power of two
    const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(totalParticipants.length));
    const totalInitialRounds = nextPowerOfTwo/2;
    }catch(error :any){
      console.error("Error:", error.message);
    }
    // // Get the next round id
    // const groupId = await getGroupsByTournamentId(tournamentData.tournamentId);
    // const roundsId = await getRoundsByGroupId(groupId[0].groupId); // Si es un arreglo, ajusta según su estructura.

    // try {
    //   // Ordenar roundsId por roundNumber de menor a mayor
    //   const sortedRounds = roundsId.sort((a, b) => a.roundNumber - b.roundNumber);
    
    //   // Encontrar el índice del round actual
    //   const currentRoundIndex = sortedRounds.findIndex(
    //     (round) => round.roundId === tournamentData.roundId
    //   );
    
    //   if (currentRoundIndex === -1) {
    //     throw new Error("No se encontró el round actual en roundsId");
    //   }
    //   const currentRound = sortedRounds[currentRoundIndex];
    
    //   // Obtener el siguiente round (si existe)
    //   const nextRound = sortedRounds[currentRoundIndex + 1];
    
    //   if (!nextRound) {
    //     // Si no hay un siguiente round, devolver el mismo matchId con participantes nulos
    //     return {
    //       nexRoundId:null,
    //       matchNumber:null,
    //       participant1Id: null,
    //       participant2Id: null,
    //     };
    //   }

    //   const matchesId = await getMatchesByRoundId(tournamentData.roundId); // obtener todos los matches del round actual
    //   const currentMatch = matchesId.find(match => Number(match.matchId) === Number(tournamentData.previousMatchId));


    //   if (!currentMatch) {
    //     throw new Error("Match no encontrado en la ronda actual.");
    //   }
    //   // Obtener el matchNumber del match actual
    //   const currentMatchNumber = currentMatch.matchNumber;
    //   // Obtener el matchNumber mayor y menor
    //   const matchNumbers = matchesId.map(match => match.matchNumber);
    //   const maxMatchNumber = Math.max(...matchNumbers);
    //   const minMatchNumber = Math.min(...matchNumbers);
    //   // Calcular el siguiente matchNumber basado en n
    //   const matchCount = matchesId.length;  // Número total de matches en la ronda actual

    //   // Calcular el siguiente matchNumber basado en la fórmula
    //   const range = maxMatchNumber - minMatchNumber + 1; // (max - min + 1)
    //   const nextMatchNumber = Math.ceil((currentMatchNumber % range) / 2) + maxMatchNumber;

    //   console.log("Match actual:", currentMatch);
    //   console.log("MatchNumber actual:", currentMatchNumber);
    //   console.log("MatchNumber mayor:", maxMatchNumber);
    //   console.log("MatchNumber menor:", minMatchNumber);
    //   console.log("Siguiente MatchNumber:", nextMatchNumber);

    //   const nextMatchResponse = await getMatchByRoundIdAndMatchNumber(nextRound.roundId, nextMatchNumber);

    //   // Ahora debes obtener el siguiente match de la lista
    //   const nextMatch = nextMatchResponse.find(match => match.matchNumber === nextMatchNumber);
    //   console.log("nextMatch:", nextMatch);
    //   // Verificar si nextMatch existe y procesarlo
    //   if (nextMatch != null) {
        
    //     if (currentMatchNumber % 2 === 0) {
    //       // return {
    //       //   nextMatchId: nextMatch.matchId ?? null,
    //       //   participant1Id: null,
    //       //   participant2Id: tournamentData.participantId,
    //       // };
    //       await fetch(`/api/dev/tournament/match/${nextMatch.matchId}`, {
    //         method: 'PATCH',
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //               participant1Id: null,
    //               participant2Id: Number(tournamentData.participantId),
    //             }),
    //       });
    //       return true;
    //     } else {
    //       // return {
    //       //   nextMatchId: nextMatch.matchId ?? null,
    //       //   participant1Id: tournamentData.participantId,
    //       //   participant2Id: null,
    //       // };
    //       await fetch(`/api/dev/tournament/match/${nextMatch.matchId}`, {
    //         method: 'PATCH',
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //               participant1Id: Number(tournamentData.participantId),
    //               participant2Id: null,
    //             }),
    //       });
    //       return true;
    //     }
    //   } else {
    //     console.log("No se encontró el siguiente match");
    //     return false;
    //   }

    // } catch (error : any) {
    //   console.error("Error:", error.message);
    // }
    

  return {
    message: "Tournament structure successfully updated",
  };
};
