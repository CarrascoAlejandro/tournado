"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation"; // Importar useRouter para redirigir

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
  const [userEmail, setUserEmail] = useState<string | null>(null); 
  const [tournamentData, setTournamentData] = useState<any | null>(null); 
  const router = useRouter(); // Instancia del router para redirigir

  // Fetch para obtener los participantes del torneo
  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/dev/get-participants/${tournamentId}`);
      const data = await res.json();

      if (res.ok) {
        setParticipants(data.participants);
      } else {
        setError(data.error || "There was an error fetching the participants.");
      }
    } catch (error) {
      setError("Error connecting to the server.");
    }
  };

  // Fetch para obtener la sesión del usuario y su correo
  const fetchUserEmail = async () => {
    try {
      const res = await fetch("/api/auth/session"); 
      const data = await res.json();

      if (res.ok && data?.user?.email) {
        setUserEmail(data.user.email); 
      } else {
        setUserEmail(null); // El usuario no está autenticado
        router.push("/login"); // Redirigir a la página de login
      }
    } catch (error) {
      setError("Error fetching user email.");
      router.push("/login"); // Redirigir si hay error al obtener la sesión
    }
  };

  // Fetch para obtener los datos del torneo
  const getTournamentData = async () => {
    try {
      const res = await fetch(`/api/dev/tournament-details/${tournamentId}`);
      const data = await res.json();

      if (res.ok) {
        setTournamentData(data.tournament);
      } else {
        setError(data.error || "There was an error fetching tournament data.");
      }
    } catch (error) {
      setError("Error connecting to the server.");
    }
  };

  // Verificar la validez del correo cuando los datos estén cargados
  useEffect(() => {
    if (userEmail === null) {
      // Ya se redirige a login antes si no hay sesión
      return;
    }
    
    if (userEmail && tournamentData) {
      if (tournamentData.userMail !== userEmail) {
        setError("You don't have access to this tournament.");
        setLoading(false); // Detener el loading si el correo no coincide
      } else {
        setLoading(false); // Una vez que la validación esté completa, quitar el loading
      }
    }
  }, [userEmail, tournamentData]);

  // Handle de la lógica de los partidos (Match Games)
  const handleMatchLogic = async () => {
    setLoading(true);
    try {
      const fetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
      const fetchData = await fetchRes.json();

      if (fetchRes.ok) {
        // Si ya hay brackets, guardarlos y navegar
        localStorage.setItem("matchBrackets", JSON.stringify(fetchData));
        const tournamentUrl = `/bracket-tournament/${tournamentId}`;
        window.open(tournamentUrl, "_blank");
        setError(null);
      } else if (fetchData.error === "Tournament don't started yet") {
        // Si el torneo no ha comenzado, proceder con POST para iniciarlo
        const startRes = await fetch(`/api/dev/tournament/${tournamentId}/start`, {
          method: "POST",
        });
        const startData = await startRes.json();

        if (startRes.ok) {
          console.log("Tournament started successfully.");
          // Obtener brackets nuevamente después de iniciar el torneo
          const newFetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
          const newFetchData = await newFetchRes.json();

          if (newFetchRes.ok) {
            // Guardar y navegar después de iniciar
            localStorage.setItem("matchBrackets", JSON.stringify(newFetchData));
            const tournamentUrl = `/bracket-tournament/${tournamentId}`;
            window.open(tournamentUrl, "_blank");
            setError(null);
          } else {
            setError(newFetchData.error || "Error fetching tournament brackets after starting.");
          }
        } else {
          setError(startData.error || "Error starting the tournament.");
        }
      } else {
        setError(fetchData.error || "Error fetching tournament brackets.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false); // Desactivar el indicador de carga
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchParticipants();
    }
    fetchUserEmail();
    getTournamentData();
  }, [tournamentId]);

  // Mostrar el estado de carga o el mensaje de acceso denegado si es necesario
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-lg">
          <div className="loader"></div> {Loader(250, 250)}
          <p className="text-lg text-purple-700 mt-4">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  // Si no hay correo o no hay acceso, mostrar mensaje de error
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-semibold text-center text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  // Si los datos están disponibles y el correo coincide, renderizar la vista normal
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
      <div id="google_translate_element"></div>

      {tournamentData && tournamentData.tournamentName && (
        <h1 className="text-3xl font-semibold mb-6 text-center text-purple-800">
          {tournamentData.tournamentName}
        </h1>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchParticipants}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
        <button
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={handleMatchLogic}
          disabled={loading} // Deshabilitar el botón mientras se carga
        >
          Match Games
        </button>
      </div>

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
    </div>
  );
};

// Function to generate random colors for cards
const getRandomColor = () => {
  const colors = ["#FCE38A", "#F38181", "#95E1D3", "#EAFFD0", "#B5EAEA"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default ViewTournament;
