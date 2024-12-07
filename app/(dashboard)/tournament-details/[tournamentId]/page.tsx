"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";  // Basurero como icono

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
  const router = useRouter(); 

  // Funciones de fetch
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

  const fetchUserEmail = async () => {
    try {
      const res = await fetch("/api/auth/session"); 
      const data = await res.json();

      if (res.ok && data?.user?.email) {
        setUserEmail(data.user.email); 
      } else {
        setUserEmail(null);
        router.push("/login");
      }
    } catch (error) {
      setError("Error fetching user email.");
      router.push("/login");
    }
  };

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

  // Efecto de verificación
  useEffect(() => {
    if (userEmail === null) {
      return;
    }

    if (userEmail && tournamentData) {
      if (tournamentData.userMail !== userEmail) {
        setError("You don't have access to this tournament.");
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [userEmail, tournamentData]);

  // Lógica de inicio de torneo
  const handleMatchLogic = async () => {
    setLoading(true);
    try {
      const fetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
      const fetchData = await fetchRes.json();

      if (fetchRes.ok) {
        localStorage.setItem("matchBrackets", JSON.stringify(fetchData));
        const tournamentUrl = `/bracket-tournament/${tournamentId}`;
        window.open(tournamentUrl, "_blank");
        setError(null);
      } else if (fetchData.error === "Tournament don't started yet") {
        const startRes = await fetch(`/api/dev/tournament/${tournamentId}/start`, {
          method: "POST",
        });
        const startData = await startRes.json();

        if (startRes.ok) {
          const newFetchRes = await fetch(`/api/dev/tournament/${tournamentId}/brackets`);
          const newFetchData = await newFetchRes.json();

          if (newFetchRes.ok) {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchParticipants();
    }
    fetchUserEmail();
    getTournamentData();
  }, [tournamentId]);

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

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-semibold text-center text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
      <div id="google_translate_element"></div>

      {tournamentData && tournamentData.tournamentName && (
        <h1 className="text-4xl font-bold mb-6 text-center text-purple-800">
          {tournamentData.tournamentName}
        </h1>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-4xl mb-6 p-6 bg-indigo-100 rounded-lg shadow-xl">
        <div className="mb-4 md:mb-0">
          <p className="text-lg font-semibold text-gray-700">Tournament Owner:</p>
          <p className="text-md text-gray-600">{tournamentData?.userMail}</p>
        </div>

        <div className="mb-4 md:mb-0">
          <p className="text-lg font-semibold text-gray-700">Tournament Code:</p>
          <p className="text-md text-gray-600">{tournamentData?.tournamentCode}</p>
        </div>
      </div>

      <div className="mb-6 w-full max-w-4xl p-4 bg-indigo-50 rounded-lg shadow-md">
        <div className="text-lg font-semibold text-gray-700">
          <p><strong>Start Date:</strong> {new Date(tournamentData?.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(tournamentData?.endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {tournamentData?.status}</p>
          <p><strong>Tags:</strong> {tournamentData?.tags}</p>
        </div>
      </div>

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
          disabled={loading}
        >
          Match Games
        </button>
      </div>

      {participants.length > 0 ? (
        <div className="overflow-x-auto w-full max-w-4xl">
          <table className="table-auto w-full border-collapse shadow-lg rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-gray-600">Participant</th>
                <th className="px-4 py-2 text-left text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.participantId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-4 text-gray-700">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: getRandomColor() }}
                    >
                      {participant.participantName.charAt(0).toUpperCase()}
                    </div>
                    <span>{participant.participantName}</span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button className="text-red-500 hover:text-red-700 transition-colors">
                      <FaTrashAlt size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 text-center">No participants registered yet.</p>
      )}
    </div>
  );
};

const getRandomColor = () => {
  const colors = ["#FCE38A", "#F38181", "#95E1D3", "#EAFFD0", "#B5EAEA"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default ViewTournament;
