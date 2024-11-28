"use client";

import React, { useEffect, useState, useRef } from "react";
import {updateParticipantMatch} from "utils/update-participant-match";
import { set } from "zod";


const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;
  // const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showInputMask, setShowInputMask] = useState(false);
  const opponent1Ref = useRef<HTMLInputElement>(null);
  const opponent2Ref = useRef<HTMLInputElement>(null);
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [opponentPassedId, setOpponentPassedId] = useState<number | null>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);


interface Participant {
  id: number;
  participantName: string;
}
interface Match {
  id: string;
  opponent1: {
    id: number;
  } | null;
  opponent2: {
    id: number;
  } | null;
  opponent1Name?: string; // Opcional, porque puede no estar disponible al inicio
  opponent2Name?: string; // Opcional, porque puede no estar disponible al inicio
  round_id?: number;
}

// Si quieres ver cuando se actualiza roundId
useEffect(() => {
  console.log("match guardado con round id", roundId);
  console.log("match guardado con match id", matchId);
  setReady(false);
}, [roundId, matchId]); // Esto se ejecutará cada vez que roundId cambie
useEffect(() => {
  console.log("match guardado con opponentPassedId", opponentPassedId);
  setReady(true);
}, [ opponentPassedId]); // Esto se ejecutará cada vez que roundId cambie

useEffect(() => {
  const fetchData = async () => {
    if (ready) {
      try {
        const updatedMatch = await updateParticipantMatch({
          tournamentId: Number(tournamentId) ?? 0,
          roundId: roundId ?? 0,
          previousMatchId: matchId ?? 0,
          participantId: opponentPassedId ?? 0,
        });
        console.log("updatedMatch", updatedMatch);
      } catch (error) {
        console.error("Error updating match:", error);
      }
    }
  };

  fetchData(); // Llama a la función async
}, [ready]); // Esto se ejecutará cada vez que 'ready' cambie

  const fetchAndRenderBrackets = async () => {
    try {
      // Fetch the tournament data
      const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching tournament data.");
      }

      const tournamentData = await res.json();
      console.log("Fetched tournament data:", tournamentData);
      //aqui TT no te pierdas
      console.log("tournamentData.stage[0].tournamentId", tournamentData.stage[0].id)
      setTournamentId(Number(tournamentData.stage[0].id)); 

      // Render the brackets using the fetched data
      if (window.bracketsViewer) {
        window.bracketsViewer.render({
          stages: tournamentData.stage,
          matches: tournamentData.match,
          matchGames: tournamentData.match_game,
          participants: tournamentData.participant,
        });
        window.bracketsViewer.onMatchClicked = async (match: any) => {
          
          console.log("match", match)

          console.log("match con round id" , Number(match.round_id));
          setRoundId(Number(match.round_id));
          setMatchId(Number(match.id));
          // console.log("match con su id" , selectedMatch?.id);
          try {
            setSelectedMatch(match);
            await getParticipant(match);

            // console.log("o1", match.opponent1?.id)
            // console.log("o1", match.opponent2?.id)
            // const participant1 = await getParticipantsByMatchId(Number(match.opponent1?.id));
            // console.log('Participantes:', participant1);
            // const participant2 = await getParticipantsByMatchId(Number(match.opponent2?.id));
            // console.log('Participantes:', participant2);

            // setSelectedMatch({
            //   ...match,
            //   opponent1Name: participant1?.participantName || "Sin Nombre",
            //   opponent2Name: participant2?.participantName || "Sin Nombre",
            // });
          } catch (error) {
            console.error(error);
          }
          console.log("o1", match.opponent1?.id)
          console.log("o1", match.opponent2?.id)
          setShowInputMask(true);
        };
      } else {
        console.error("bracketsViewer is not defined on the window object.");
      }
    } catch (error) {
      console.error("Error fetching or rendering brackets:", error);
    }
  };

  const getParticipant = async (match:Match) =>{
    console.log("o1", match.opponent1?.id)
    console.log("o1", match.opponent2?.id)
    //FIXME
    const participant1 = await getParticipantsByMatchId(Number(match.opponent1?.id));
    console.log('Participantes:', participant1);
    const participant2 = await getParticipantsByMatchId(Number(match.opponent2?.id));
    console.log('Participantes:', participant2);

    setSelectedMatch({
              ...match,
              opponent1Name: participant1?.participantName || "Sin Nombre",
              opponent2Name: participant2?.participantName || "Sin Nombre",
              round_id: match.round_id??0,
            });
    // console.log("selectedMatch round id:", selectedMatch?.round_id?.toString())
  }
  const updateMatch = async () => {
    if (!selectedMatch || !opponent1Ref.current || !opponent2Ref.current) return;

    const score1 = Number(opponent1Ref.current.value);
    const score2 = Number(opponent2Ref.current.value);

    try {
      console.log("score1",score1)
      console.log("score2",score2)
      const scoreData = {
        homeResult: score1,
        awayResult: score2
      };
    
      console.log("scoreData", scoreData); // Verificar los datos antes de enviar

      await fetch(`/api/dev/tournament/match/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData),
      });
      // console.log("body", body)
      setShowInputMask(false);
      let participantId=0;
      if(selectedMatch.opponent1?.id && selectedMatch.opponent2?.id){
        if(score1 > score2){
          participantId = selectedMatch.opponent1?.id;
          setOpponentPassedId(selectedMatch.opponent1?.id);
          }else{
            participantId = selectedMatch.opponent2?.id;
            setOpponentPassedId(selectedMatch.opponent2?.id);
          }
          console.log("participantId", participantId)
          // if(ready){
          //   const updatedMatch = await updateParticipantMatch({
          //     tournamentId: tournamentId ?? 0,
          //     roundId: roundId ?? 0,
          //     previousMatchId: matchId ?? 0,
          //     participantId: opponentPassedId ?? 0,
          //   });
          //   console.log("updatedMatch", updatedMatch);
          // }
      }
      // fetchAndRenderBrackets();
      //FIXME
      // Forzar recarga completa de la página
      // window.location.reload();
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const getParticipantsByMatchId = async (matchID:number) => {
    try {
      // Fetch the tournament data
      const res = await fetch(`/api/dev/get-participants/participant/${matchID}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching tournament data.");
      }

      const data = await res.json();
      console.log("Fetched participant data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }
  useEffect(() => {
    fetchAndRenderBrackets();
  }, [tournamentCode]);

  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    inputMask: {
      background: "#fff",
      padding: "20px",
      borderRadius: "8px",
      width: "90%",
      maxWidth: "400px",
      textAlign: "center" as const,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    },
    title: {
      margin: "0 0 20px 0",
      fontSize: "1.5rem",
    },
    scoreSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      margin: "20px 0",
    },
    team: {
      textAlign: "center" as const,
    },
    scoreInput: {
      fontSize: "1.5rem",
      width: "60px",
      textAlign: "center" as const,
      border: "2px solid #000",
      borderRadius: "8px",
      marginBottom: "5px",
    },
    teamName: {
      fontSize: "1rem",
      fontWeight: "bold" as const,
    },
    separator: {
      fontSize: "2rem",
      fontWeight: "bold" as const,
    },
    actions: {
      display: "flex",
      justifyContent: "space-between",
      gap: "20px",
      marginTop: "15px",
    },
    cancelButton: {
      padding: "10px 20px",
      fontSize: "1rem",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#ccc",
      color: "#000",
      cursor: "pointer",
    },
    confirmButton: {
      padding: "10px 20px",
      fontSize: "1rem",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#4F46E5",
      color: "#fff",
      cursor: "pointer",
    },
  };
  // return <div className="brackets-viewer" />;
  return (
    <div>
      <div className="brackets-viewer" />
      {showInputMask && selectedMatch && (
        <div style={styles.overlay} onClick={() => setShowInputMask(false)}>
          <div
            style={styles.inputMask}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="input-mask-title"
          >
            <h2 id="input-mask-title" style={styles.title}>
              Record result
            </h2>
            <div style={styles.scoreSection}>
              <div style={styles.team}>
                <input
                  ref={opponent1Ref}
                  type="number"
                  style={styles.scoreInput}
                  defaultValue={0}
                  min="0"
                  max="99"
                  aria-label="Puntaje del equipo 1"
                />
                <p style={styles.teamName}>{selectedMatch.opponent1Name}</p>
              </div>
              <div style={styles.separator}>:</div>
              <div style={styles.team}>
                <input
                  ref={opponent2Ref}
                  type="number"
                  style={styles.scoreInput}
                  defaultValue={0}
                  min="0"
                  max="99"
                  aria-label="Puntaje del equipo 2"
                />
                <p style={styles.teamName}>{selectedMatch.opponent2Name}</p>
              </div>
            </div>
            <div style={styles.actions}>
              <button
                onClick={() => setShowInputMask(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={() => updateMatch()} style={styles.confirmButton}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default BracketPage;
