"use client";

import { useEffect, useState } from "react";

interface Participant {
  participantId: number;
  participantName: string;
  tournamentId: number;
}

const ViewTournament = ({ params }: { params: { tournamentId: string } }) => {

  const { tournamentId } = params;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Cambiar a false inicialmente

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dev/get-participants/${tournamentId}`);
      const data = await res.json();

      if (res.ok) {
        setParticipants(data.participants);
      } else {
        setError(data.error || "There was an error fetching the participants.");
      }
    } catch (error) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchGames = async () => {
    setLoading(true); // Activar el loading al principio de la acción

    try {
      // POST to start the tournament
      const startRes = await fetch(`/api/dev/tournament/${tournamentId}/start`, {
        method: "POST",
      });
  
      const startData = await startRes.json();
  
      if (startRes.ok) {
        console.log("Tournament started successfully.");
      } else if (startData.error === "Tournament has already started") {
        console.log("Tournament has already started. Proceeding to fetch existing brackets.");
      } else {
        // Handle error from POST
        setError(startData.error || "Error starting the tournament.");
        return;
      }
  
      // GET the latest brackets and byes
      const fetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
      const fetchData = await fetchRes.json();
  
      if (fetchRes.ok) {
        // Save brackets and byes to localStorage
        localStorage.setItem("matchBrackets", JSON.stringify(fetchData));
  
        // Navigate to the bracket page
        const tournamentUrl = `/bracket-tournament/${tournamentId}`;
        window.open(tournamentUrl, "_blank");
      } else {
        // Handle error from GET
        setError(fetchData.error || "Error fetching tournament brackets.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false); // Desactivar el loading una vez terminada la función
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchParticipants();
    }
  }, [tournamentId]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center text-purple-800">Tournament Participants</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchParticipants}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
        <button
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={handleMatchGames}
          disabled={loading} // Deshabilitar el botón mientras se carga
        >
          Match Games
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-center">{error}</p>
      )}

      {participants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
          {participants.map((participant) => (
            <div
              key={participant.participantId}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-start gap-4"
              style={{ height: "120px" }}
            >
              <div
                className="h-16 w-16 rounded-full bg-purple-200 flex items-center justify-center text-2xl font-bold text-purple-800"
                style={{
                  backgroundColor: getRandomColor(),
                }}
              >
                {participant.participantName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-md font-semibold text-gray-700">{participant.participantName}</h2>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 text-center">No participants registered yet.</p>
      )}

      {/* Pop-up de carga */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-lg">
            <div className="loader"></div> {/* Aquí puedes agregar tu animación de carga */}
            <p className="text-lg text-purple-700 mt-4">Loading, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Function to generate random colors for cards
const getRandomColor = () => {
  const colors = ["#FCE38A", "#F38181", "#95E1D3", "#EAFFD0", "#B5EAEA"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default ViewTournament;
