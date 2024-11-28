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
  const [loading, setLoading] = useState<boolean>(false);

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
    setLoading(true);
    try {
      const startRes = await fetch(`/api/dev/tournament/${tournamentId}/start`, {
        method: "POST",
      });
      const startData = await startRes.json();

      if (!startRes.ok) {
        setError(startData.error || "Error starting the tournament.");
        return;
      }

      const fetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
      const fetchData = await fetchRes.json();

      if (fetchRes.ok) {
        localStorage.setItem("matchBrackets", JSON.stringify(fetchData));
        window.open(`/bracket-tournament/${tournamentId}`, "_blank");
      } else {
        setError(fetchData.error || "Error fetching tournament brackets.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchParticipants();
    }
  }, [tournamentId]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center text-purple-800">Admin Panel - Tournament</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchParticipants}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={handleMatchGames}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          Match Games
        </button>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {participants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
          {participants.map((participant, index) => (
            <div
              key={participant.participantId}
              className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
              style={{ height: "100px" }}
            >
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: getColorByIndex(index),
                  color: "white",
                  border: "2px solid black",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                }}
              >
                <span
                  style={{
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {participant.participantName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800">{participant.participantName}</h2>
                <p className="text-sm text-gray-500">Participant ID: {participant.participantId}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 text-center">No participants registered yet.</p>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-lg">
            <div className="loader"></div>
            <p className="text-lg text-purple-700 mt-4">Loading, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Function to get a color based on the participant index
const getColorByIndex = (index: number): string => {
  const vibrantColors = [
    "#FF5733", "#FF8D1A", "#FFC300", "#DAF7A6",
    "#33FF57", "#1AFF8D", "#33C3FF", "#3380FF",
    "#8D33FF", "#C300FF", "#FF33C3", "#FF3380",
    "#FF6F33", "#FFAD33", "#DFFF33", "#33FFAD",
  ];
  return vibrantColors[index % vibrantColors.length];
};

export default ViewTournament;
