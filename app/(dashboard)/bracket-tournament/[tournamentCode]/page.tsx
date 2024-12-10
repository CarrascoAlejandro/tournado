"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader } from "@/components/ui/loader";
import ConfettiAnimation   from "@/components/ui/ConfettiAnimation";
import { set } from "zod";
import Dialog from '@/components/ui/alert-dialog';

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
  const [showFinalWinnerDialog, setShowFinalWinnerDialog] = useState(false);
  const [finalWinner, setFinalWinner] = useState<number | null>(null);
  const [tournamentData, setTournamentData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);


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
    opponent1Img?: number;
    opponent2Img?: number;
    round_id?: number;
  }

  const fetchAndRenderBrackets = async () => {
    try {
      const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData);
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
            await setSelectedMatch(match);
            await getParticipant(match);
          } catch (error) {
            console.error(error);
          }
          console.log("o1", match.opponent1?.id);
          console.log("o1", match.opponent2?.id);
          //condición para mostrar el modal de ganador final
          console.log("selectedMatch for POST ", Number(match.id));
          console.log("tournamentId for POST ", Number(tournamentData.stage[0].id));
          if(match.opponent1?.id && match.opponent2?.id){
            if(match.opponent1?.score !== '-' && match.opponent2?.score !== '-'){
              await fetch(`/api/dev/tournament/match/${Number(match.id)}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  tournamentId: Number(tournamentData.stage[0].id) ?? 0
                }),
              })
              .then(response => {
                if (!response.ok) {
                  return response.json().then(errorData => {
                    console.error("Error en la solicitud POST:", errorData);
                    throw new Error(errorData.error || "Error en la solicitud POST");
                  });
                }
                return response.json();
              })
              .then(async responseData => {
                console.log("Respuesta de la solicitud POST de si es ultimo:", responseData);
                if (responseData.isLastMatch) { 
                  if(match.opponent1?.score > match.opponent2?.score){
                    setFinalWinner(match.opponent1?.id || 0);
                  }else{
                    setFinalWinner(match.opponent2?.id || 0);
                  }
                  setShowFinalWinnerDialog(true);
                }else{
                  setShowFinalWinnerDialog(false);
                  setShowInputMask(true);
                }
              })
              .catch(error => {
                  console.error("Error al realizar la solicitud POST:", error);
              });
            } else {
              setShowInputMask(true);
            }
            
          }
          
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


    await setSelectedMatch({
      ...match,
      opponent1Name: participant1?.participantName || "Sin Nombre",
      opponent2Name: participant2?.participantName || "Sin Nombre",
      opponent1Img: participant1?.img || 1,
      opponent2Img: participant2?.img || 1,

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
              if (response.status === 404) {// Si el status es 404, no hay siguiente match, es la final
                return;
              } else {
                return response.json().then(errorData => {
                  console.error("Error en la solicitud PATCH:", errorData);
                  throw new Error(errorData.error || "Error en la solicitud PATCH");
                });
              }
            }
            return response.json();
          })
          .then(data => {
            console.log("Respuesta de la solicitud PATCH:", data);
            window.location.reload();
          })
          .catch(error => {
            console.error("Error al realizar la solicitud PATCH:", error);
          });

        
        
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

  const getTournamentData = async () => {
    try {
      const res = await fetch(`/api/dev/tournament-details/${tournamentCode}`);
      const data = await res.json();

      if (res.ok) {
        console.log("KKT Tournament data:", data.tournament);
        setTournamentData(data.tournament);
      } else {
        setError(data.error || "There was an error fetching tournament data.");
      }
    } catch (error) {
      setError("Error connecting to the server.");
    }
  };

  useEffect(() => {
    fetchAndRenderBrackets();
    getTournamentData();
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

  const renderDialog = () => {
    if (showFinalWinnerDialog && selectedMatch && finalWinner) {
      return (
        <div>
        
        {/* {selectedMatch && showFinalWinnerDialog && window.bracketsViewer&& (
          <ConfettiAnimation show={true}/> 
        )} */}
        <Dialog
          visible={showFinalWinnerDialog}
          onHide={() => setShowFinalWinnerDialog(false)}
          header="Final Result"
          color="info"
          icon={<span style={{ fontSize: '2rem' }}>🎉</span>}
          footer={
            <>
              
            </>
          }
          
        >
          <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              textAlign: "center" 
            }}>
              <img
                  src={`/static/profile/${finalWinner === selectedMatch?.opponent1?.id ? selectedMatch.opponent1Img : selectedMatch.opponent2Img}.png`}
                  alt={`Profile of ${finalWinner === selectedMatch?.opponent1?.id ? selectedMatch.opponent1Name : selectedMatch.opponent2Name}`}
                  className="h-20 w-20 rounded-full border-2 border-blue-400 shadow-lg"
              />
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                  {finalWinner === selectedMatch?.opponent1?.id ? selectedMatch.opponent1Name : selectedMatch.opponent2Name}
              </p>
          </div>
          <p style={{ textAlign: "center" }}>
            <strong style={{ color: "#4A90E2", fontSize: "1.2rem" }}>Congratulations to the winner!</strong>
          </p>
        </Dialog>
        </div>
      );
    }

    // else if (showFinalWinnerDialog && selectedMatch && finalWinner) {
    //   return (
    //     <div>
    //       <ConfettiAnimation show={true}/> 
    //     </div>
    //   );
    // }
  };

  return (

    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6" >
      {renderDialog()}
       
      {loading && Loader(250, 250)}

      {!loading && error && (
        <h1 className="text-3xl font-semibold text-center text-red-500">{error}</h1>
      )}

      {!loading && !error && (
        <div className="mb-6 w-full max-w-4xl p-4 bg-indigo-50 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-gray-700">
            <p><strong>Start Date:</strong> {new Date(tournamentData?.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(tournamentData?.endDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {tournamentData?.status}</p>
            <p><strong>Tags:</strong> {tournamentData?.tags}</p>
          </div>
        </div>
      )}
      
      <div style={{ padding: "20px" }}>
      
        <div className="brackets-viewer" />
        {/* {showFinalWinnerDialog && <ConfettiAnimation show={true} />} */}
        
      </div>
      {showInputMask && selectedMatch && (
        
        <div style={styles.overlay} onClick={() => setShowInputMask(false)}>
          
          <div
            style={{
              ...styles.inputMask,
              padding: "20px",
              maxWidth: "500px",
              textAlign: "center",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              background: "white",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="input-mask-title"
          >
            <h2
              id="input-mask-title"
              style={{
                ...styles.title,
                fontSize: "1.8rem",
                color: "#4A90E2",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Record Result
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "30px",
                margin: "20px 0",
              }}
            >
              {/* Oponente 1 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "15px",
                  flex: 1,
                }}
              >
                <img
                  src={`/static/profile/${selectedMatch.opponent1Img}.png`}
                  alt={`Profile of ${selectedMatch.opponent1Name}`}
                  className="h-20 w-20 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    {selectedMatch.opponent1Name}
                  </p>
                  <input
                    ref={opponent1Ref}
                    type="number"
                    style={{
                      width: "80px",
                      height: "40px",
                      textAlign: "center",
                      padding: "5px",
                      fontSize: "1.2rem",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.1)",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4A90E2")}
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    defaultValue={0}
                    min="0"
                    max="99"
                    aria-label="Score of opponent 1"
                  />
                </div>
              </div>
              {/* Separador */}
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#4A90E2",
                  flexShrink: 0,
                }}
              >
                VS
              </div>
              {/* Oponente 2 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "15px",
                  flex: 1,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#333",
                      textAlign: "right",
                    }}
                  >
                    {selectedMatch.opponent2Name}
                  </p>
                  <input
                    ref={opponent2Ref}
                    type="number"
                    style={{
                      width: "80px",
                      height: "40px",
                      textAlign: "center",
                      padding: "5px",
                      fontSize: "1.2rem",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.1)",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#4A90E2")}
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                    defaultValue={0}
                    min="0"
                    max="99"
                    aria-label="Score of opponent 2"
                  />
                </div>
                <img
                  src={`/static/profile/${selectedMatch.opponent2Img}.png`}
                  alt={`Profile of ${selectedMatch.opponent2Name}`}
                  className="h-20 w-20 rounded-full border-2 border-blue-400 shadow-lg"
                />
              </div>
            </div>
            {/* Botones */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "20px",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setShowInputMask(false)}
                style={{
                  padding: "10px 20px",
                  fontSize: "1rem",
                  background: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}

              >
                Cancel
              </button>
              <button
                onClick={() => updateMatch()}
                style={{
                  padding: "10px 20px",
                  fontSize: "1rem",
                  background: "#4A90E2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}

              >
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