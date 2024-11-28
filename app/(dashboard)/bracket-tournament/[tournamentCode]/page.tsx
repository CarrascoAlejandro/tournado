"use client";

import React, { useEffect, useState, useRef } from "react";
import Dialog from '@/components/ui/alert-dialog';

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;
  // const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showInputMask, setShowInputMask] = useState(false);
  const opponent1Ref = useRef<HTMLInputElement>(null);
  const opponent2Ref = useRef<HTMLInputElement>(null);

  const [showTieDialog, setShowTieDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);


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
            await getParticipant(match);
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
            });
  }

  const updateMatch = async () => {
    if (!selectedMatch || !opponent1Ref.current || !opponent2Ref.current) return;

    const score1 = Number(opponent1Ref.current.value);
    const score2 = Number(opponent2Ref.current.value);

    if (score1 === score2) {
      setShowInputMask(false); // Cerrar el modal de registro de resultados
      setShowTieDialog(true); // Abrir el modal de empate
      return;
    }

    const winner =
      score1 > score2
        ? selectedMatch?.opponent1Name
        : selectedMatch?.opponent2Name;

    setWinnerName(winner || "Sin nombre");
    setResult(`${score1}-${score2}`);
    setShowInputMask(false); // Cerrar el modal de registro
    setShowConfirmDialog(true); // Mostrar el diálogo de confirmación
  };

  const confirmWinner = async () => {
    try {
      const score1 = Number(opponent1Ref.current?.value);
      const score2 = Number(opponent2Ref.current?.value);

      const scoreData = {
        homeResult: score1,
        awayResult: score2,
      };

      await fetch(`/api/dev/tournament/match/${selectedMatch?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });

      setShowConfirmDialog(false); // Cerrar el diálogo de confirmación
      setShowSuccessDialog(true); // Mostrar el diálogo de éxito

      //FIXME
      // Forzar recarga completa de la página
      window.location.reload(); // Recargar la página después de actualizar
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  // const updateMatch = async () => {
  //   if (!selectedMatch || !opponent1Ref.current || !opponent2Ref.current) return;

  //   const score1 = Number(opponent1Ref.current.value);
  //   const score2 = Number(opponent2Ref.current.value);

  //   if (score1 === score2) {
  //     // setShowResultDialog(false);
  //     setShowTieDialog(true); // Mostrar alerta de empate
  //     setShowInputMask(false);
  //     return;
  //   }

  //   try {
  //     console.log("score1",score1)
  //     console.log("score2",score2)
  //     const scoreData = {
  //       homeResult: score1,
  //       awayResult: score2
  //     };
    
  //     console.log("scoreData", scoreData); // Verificar los datos antes de enviar

  //     await fetch(`/api/dev/tournament/match/${selectedMatch.id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(scoreData),
  //     });
  //     // console.log("body", body)
  //     setShowInputMask(false);
  //     // fetchAndRenderBrackets();
  //     //FIXME
  //     // Forzar recarga completa de la página
  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Failed to update match:", error);
  //   }
  // };

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
      backgroundColor: "#374151",
      color: "#fff",
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

  // Renderizar diálogos según el estado
  const renderDialog = () => {
    if (showTieDialog) {
      return (
        <Dialog
          visible={showTieDialog}
          onHide={() => setShowTieDialog(false)}
          header="Tie Detected"
          color="warning"
          icon={<span>⚠️</span>} // Icono de advertencia
          footer={
            <>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#374151",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                // onClick={() => setShowTieDialog(false)}
                  onClick={() => {
                    setShowTieDialog(false); // Cerrar el modal de empate
                    setShowInputMask(false); // Reabrir el modal de registro
                  }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4F46E5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                // onClick={() => setShowTieDialog(false)}
                onClick={() => {
                  setShowTieDialog(false); // Cerrar el modal de empate
                  setShowInputMask(true); // Reabrir el modal de registro
                }}
              >
                Confirmar
              </button>
            </>
          }
        >
          <p>
          A tie result has been recorded. However, it is necessary to choose a
            winner to proceed to the next phase of the tournament. 
            Please enter another result.
          </p>
        </Dialog>
      );
    }

    if (showConfirmDialog) {
      return (
        <Dialog
          visible={showConfirmDialog}
          onHide={() => setShowConfirmDialog(false)}
          header="Register Result"
          color="info"
          icon={<span>ℹ️</span>}
          footer={
            <>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#374151",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                // onClick={() => setShowConfirmDialog(false)}
                onClick={() => {
                  setShowConfirmDialog(false); // Cerrar el modal 
                  setShowInputMask(true); // Reabrir el modal de registro
                }}
              >
                Cancelar
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4F46E5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={confirmWinner}
              >
                Confirmar
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to register <strong>{winnerName}</strong> as the winner
            of the match between {selectedMatch?.opponent1Name} and{" "}
            {selectedMatch?.opponent2Name} with a score of <strong>{result}</strong>?
          </p>
        </Dialog>
      );
    }

    if (showSuccessDialog) {
      return (
        <Dialog
          visible={showSuccessDialog}
          onHide={() => setShowSuccessDialog(false)}
          header="Result Registered!"
          color="success"
          icon={<span>✓</span>}
          footer={
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#4F46E5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => setShowSuccessDialog(false)}
            >
              Aceptar
            </button>
          }
        >
          <p>
          The result has been successfully recorded for <strong>{winnerName}</strong> as the winner
            with a score of {result}.
          </p>
        </Dialog>
      );
    }

    return null; // Si no hay diálogos activos, no renderiza nada
  };


  // return <div className="brackets-viewer" />;
  return (
    <div>
      <div className="brackets-viewer" />

      {/* Renderizar el diálogo dinámicamente */}
      {renderDialog()}

      {/* score */}
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
