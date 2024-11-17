// app/api/dev/get-participants/[tournamentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, participants, getTournamentIdByCode } from "@/lib/db"; // Conexión y tabla desde db.ts
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  console.log("API Request received:", req.url);

  try {
    console.log("Extracting params...");
    if (!params || !params.tournamentId) {
      console.error("Params are missing or invalid:", params);
      return NextResponse.json(
        { error: "El parámetro 'tournamentId' es requerido." },
        { status: 400 }
      );
    }

    const { tournamentId } = params;
    console.log("Tournament ID received:", tournamentId);

    // Obtener el ID del torneo desde el código
    const tournamentIdFromCode = await getTournamentIdByCode(tournamentId);
    console.log("Tournament ID from code:", tournamentIdFromCode);

    if (!tournamentIdFromCode) {
      console.error(
        "No tournament found for the provided code:",
        tournamentId
      );
      return NextResponse.json(
        { error: "No se encontró un torneo con el código proporcionado." },
        { status: 404 }
      );
    }

    console.log("Querying database for participants with tournament ID:", tournamentIdFromCode);
    const tournament = await db
      .select()
      .from(participants)
      .where(eq(participants.tournamentId, tournamentIdFromCode));

    console.log("Database query result:", tournament);

    if (tournament.length === 0) {
      console.warn(
        "No participants found for the provided tournament ID:",
        tournamentIdFromCode
      );
      return NextResponse.json(
        { error: "No se encontraron participantes para este torneo." },
        { status: 404 }
      );
    }

    console.log("Returning participants:", tournament);
    return NextResponse.json({ participants: tournament });
  } catch (error) {
    console.error("Unhandled error while fetching participants:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, intenta más tarde." },
      { status: 500 }
    );
  }
}
