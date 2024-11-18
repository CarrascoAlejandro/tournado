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
  const [loading, setLoading] = useState<boolean>(true);

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
          onClick={() => alert('Match Games logic coming soon!')}
        >
          Match Games
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
          <p className="text-lg text-purple-700 ml-4">Loading participants...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : participants.length > 0 ? (
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
    </div>
  );
};

// Function to generate random colors for cards
const getRandomColor = () => {
  const colors = ["#FCE38A", "#F38181", "#95E1D3", "#EAFFD0", "#B5EAEA"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default ViewTournament;
