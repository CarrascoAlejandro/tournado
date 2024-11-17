"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Importar useRouter para la redirección
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const JoinTournamentPage: React.FC = () => {
  const [tournamentId, setTournamentId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carga
  const router = useRouter(); // Usar el hook useRouter para la redirección

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    // Validación básica
    if (!tournamentId || !participantName) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch("/api/dev/join-tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentId,
          participantName,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccessMessage("¡Te has unido al torneo exitosamente!");
        setError("");
        setTournamentId("");
        setParticipantName("");
        router.push(`/view-tournament/${tournamentId}`);
      } else {
        // Mensaje de error más detallado
        setError(data.error || "Ocurrió un error al unirte al torneo.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setError("Error de red. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-red-50 to-red-100">
      <Card className="w-full max-w-md p-6 shadow-xl bg-white rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            Unirme a un Torneo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}
            <div>
              <label
                htmlFor="tournamentId"
                className="block text-sm font-medium text-gray-700"
              >
                ID de Torneo
              </label>
              <Input
                type="text"
                id="tournamentId"
                name="tournamentId"
                placeholder="Ingrese el ID del torneo"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="participantName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre del Participante
              </label>
              <Input
                type="text"
                id="participantName"
                name="participantName"
                placeholder="Ingrese su nombre"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                required
              />
            </div>
            <div className="mt-6 flex justify-center">
            <Button
  type="submit"
  className={`px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-transform transform hover:-translate-y-1 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={loading}
>
  {loading ? (
    <span className="animate-spin">🔄</span> // Spinner o ícono de carga
  ) : (
    "Unirse"
  )}
</Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTournamentPage;
