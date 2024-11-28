"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader } from "@/components/ui/loader";

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const [loading, setLoading] = useState(true);
  const { tournamentCode } = params;
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showInputMask, setShowInputMask] = useState(false);
  const opponent1Ref = useRef<HTMLInputElement>(null);
  const opponent2Ref = useRef<HTMLInputElement>(null);
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [opponentPassedId, setOpponentPassedId] = useState<number | null>(null);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);

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
    opponent1Name?: string;
    opponent2Name?: string;
    round_id?: number;
  }

  const fetchAndRenderBrackets = async () => {
    try {
      const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching tournament data.");
      }

      const tournamentData = await res.json();
      console.log("Fetched tournament data:", tournamentData);
      setTournamentId(Number(tournamentData.stage[0].id));

      if (window.bracketsViewer) {
        window.bracketsViewer.render({
          stages: tournamentData.stage,
          matches: tournamentData.match,
          matchGames: tournamentData.match_game,
          participants: tournamentData.participant,
        });
        window.bracketsViewer.onMatchClicked = async (match: any) => {
          console.log("match", match);
          console.log("match con round id", Number(match.round_id));
          setRoundId(Number(match.round_id));
          setMatchId(Number(match.id));
          try {
            setSelectedMatch(match);
            await getParticipant(match);
          } catch (error) {
            console.error(error);
          }
          console.log("o1", match.opponent1?.id);
          console.log("o1", match.opponent2?.id);
          setShowInputMask(true);
        };
        setLoading(false);
      } else {
        console.error("bracketsViewer is not defined on the window object.");
      }
    } catch (error) {
      console.error("Error fetching or rendering brackets:", error);
    }
  };

  const getParticipant = async (match: Match) => {
    console.log("o1", match.opponent1?.id);
    console.log("o1", match.opponent2?.id);
    const participant1 = await getParticipantsByMatchId(Number(match.opponent1?.id));
    console.log('Participantes:', participant1);
    const participant2 = await getParticipantsByMatchId(Number(match.opponent2?.id));
    console.log('Participantes:', participant2);

    setSelectedMatch({
      ...match,
      opponent1Name: participant1?.participantName || "Sin Nombre",
      opponent2Name: participant2?.participantName || "Sin Nombre",
      round_id: match.round_id ?? 0,
    });
  };

  const updateMatch = async () => {
    if (!selectedMatch || !opponent1Ref.current || !opponent2Ref.current) return;

    const score1 = Number(opponent1Ref.current.value);
    const score2 = Number(opponent2Ref.current.value);

    try {
      console.log("score1", score1);
      console.log("score2", score2);
      const scoreData = {
        homeResult: score1,
        awayResult: score2
      };

      console.log("scoreData", scoreData);

      await fetch(`/api/dev/tournament/match/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData),
      });

      setShowInputMask(false);
      let participantId = 0;
      if (selectedMatch.opponent1?.id && selectedMatch.opponent2?.id) {
        if (score1 > score2) {
          participantId = selectedMatch.opponent1?.id;
          setOpponentPassedId(selectedMatch.opponent1?.id);
        } else {
          participantId = selectedMatch.opponent2?.id;
          setOpponentPassedId(selectedMatch.opponent2?.id);
        }
        console.log("participantId", participantId);

        // Trigger the PATCH request after updating the match
        await fetch(`/api/dev/tournament/match`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tournamentId: Number(tournamentId) ?? 0,
            roundId: roundId ?? 0,
            previousMatchId: matchId ?? 0,
            participantId: participantId ?? 0,
          }),
        })
        .then(response => {
            if (!response.ok) {
              return response.json().then(errorData => {
                console.error("Error en la solicitud PATCH:", errorData);
                throw new Error(errorData.error || "Error en la solicitud PATCH");
              });
            }
            return response.json();
          })
          .then(data => {
            console.log("Respuesta de la solicitud PATCH:", data);
          })
          .catch(error => {
            console.error("Error al realizar la solicitud PATCH:", error);
        });

        // Refetch and render brackets after updating the match
        // fetchAndRenderBrackets();
      }
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const getParticipantsByMatchId = async (matchID: number) => {
    try {
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
  };

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