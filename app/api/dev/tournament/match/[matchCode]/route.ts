import { updateMatchResults, isLastMatchInTournament } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { matchCode: string } }) {
  try {
    const { matchCode } = params; // matchCode debería ser el matchId en tu caso
    const { homeResult, awayResult } = await req.json(); // Leer los datos enviados en el cuerpo de la solicitud

    // Verificar que los parámetros sean válidos
    if (typeof homeResult !== "number" || typeof awayResult !== "number") {
      return NextResponse.json({ error: "Invalid result values" }, { status: 400 });
    }

    // Actualizar el resultado del partido en la base de datos
    const updatedMatch = await updateMatchResults(Number(matchCode), homeResult, awayResult);

    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Retornar la respuesta con el partido actualizado
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { matchCode: string } }) {
  try {
    const { matchCode } = params; // matchCode debería ser el matchId en tu caso
    const { participant1Id, participant2Id } = await req.json(); // Leer los datos enviados en el cuerpo de la solicitud

    // Verificar que los parámetros sean válidos
    if (typeof participant1Id !== "number" || typeof participant2Id !== "number") {
      return NextResponse.json({ error: "Invalid id participant values" }, { status: 400 });
    }

    // Actualizar el resultado del partido en la base de datos
    const updatedMatch = await updateMatchResults(Number(matchCode), Number(participant1Id), Number(participant2Id));

    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Retornar la respuesta con el partido actualizado
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match participant id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { matchCode: string} }) {
  try {
    const { matchCode } = params;
    const { tournamentId } = await req.json();
    // Validar los parámetros
    console.log("in post:" + matchCode, tournamentId);
    if (!matchCode || !tournamentId || isNaN(Number(matchCode)) || isNaN(Number(tournamentId))) {
      return NextResponse.json({ error: "Invalid matchCode or tournamentId" }, { status: 400 });
    }

    // Verificar si el partido es el último del torneo
    const isLastMatch = await isLastMatchInTournament(Number(tournamentId), Number(matchCode));
    console.log("isLastMatch en POST:", isLastMatch);
    // Responder con el estado de si es el último partido o no
    return NextResponse.json({ isLastMatch });
  } catch (error) {
    console.error("Error checking if match is the last in the tournament:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
