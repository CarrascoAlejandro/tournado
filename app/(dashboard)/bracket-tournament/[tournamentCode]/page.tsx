"use client";

import { Console } from "console";
import React, { useEffect, useState, useRef } from "react";
// import styles from "@/app/BracketPage.module.css";

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;
  // const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showInputMask, setShowInputMask] = useState(false);
  // const opponent1Ref = useRef(null);
  // const opponent2Ref = useRef(null);
  const opponent1Ref = useRef<HTMLInputElement>(null);
  const opponent2Ref = useRef<HTMLInputElement>(null);
  // const [scoreData, setScoreData] = useState({
  //   homeResult:'',
  //   awayResult: ''
  // });
  /*{

    homeResult: score1,
    awayResult: score2
    
  } */

interface Participant {
  id: number;
  name: string;
}

interface Match {
  id: string;
  participant1: string | null;
  participant2: string | null;
}
  

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

      // Render the brackets using the fetched data
      if (window.bracketsViewer) {
        window.bracketsViewer.render({
          stages: tournamentData.stage,
          matches: tournamentData.match,
          matchGames: tournamentData.match_game,
          participants: tournamentData.participant,
        });
        window.bracketsViewer.onMatchClicked = async (match: any) => {
          setSelectedMatch(match);
          console.log("match", match)
          try {
            const id = Number(match.id);
            console.log("matchID", match.id)
            // const participants = await getParticipantsByMatchId(id);
            // console.log('Participantes:', participants);
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
      // fetchAndRenderBrackets();
      //FIXME
      // Forzar recarga completa de la página
      window.location.reload();
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const getParticipantsByMatchId = async (matchID:number) => {
    try {
      // Fetch the tournament data
      const res = await fetch(`/api/dev/get-paticipants/${matchID}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching tournament data.");
      }

      const data = await res.json();
      console.log("Fetched participant data:", data);
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
      fontSize: "2rem",
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
      backgroundColor: "#007bff",
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
              Registrar Resultado
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
                {/* <p style={styles.teamName}>{selectedMatch.opponent1Name}</p> */}
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
                {/* <p style={styles.teamName}>{selectedMatch.opponent2Name}</p> */}
              </div>
            </div>
            <div style={styles.actions}>
              <button
                onClick={() => setShowInputMask(false)}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button onClick={() => updateMatch()} style={styles.confirmButton}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default BracketPage;
