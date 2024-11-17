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
        setError(data.error || "Hubo un error al obtener los participantes.");
      }
    } catch (error) {
      setError("Error al conectar con el servidor.");
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
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">
        Participantes del Torneo
      </h1>

      <button
        onClick={fetchParticipants}
        className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 mb-4"
      >
        Actualizar
      </button>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
          <p className="text-lg text-purple-700 ml-4">Cargando participantes...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : participants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {participants.map((participant) => (
            <div
              key={participant.participantId}
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center"
            >
              <div
                className="h-24 w-24 rounded-full bg-purple-200 flex items-center justify-center text-2xl font-bold text-purple-700"
                style={{
                  backgroundColor: getRandomColor(),
                }}
              >
                {participant.participantName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold mt-4 text-gray-700">
                {participant.participantName}
              </h2>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">No hay participantes registrados.</p>
      )}
    </div>
  );
};

// Función para generar colores aleatorios para las cards
const getRandomColor = () => {
  const colors = ["#FCE38A", "#F38181", "#95E1D3", "#EAFFD0", "#B5EAEA"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default ViewTournament;
