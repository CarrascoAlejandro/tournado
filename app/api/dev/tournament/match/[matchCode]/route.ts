import { updateMatchResults } from "@/lib/db";
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
