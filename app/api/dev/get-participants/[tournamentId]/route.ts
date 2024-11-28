// app/api/dev/get-participants/[tournamentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, participants, getTournamentByCode } from "@/lib/db"; // Conexión y tabla desde db.ts
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
        { error: "The 'tournamentId' parameter is required." },
        { status: 400 }
      );
    }

    const { tournamentId } = params;
    console.log("Tournament ID received:", tournamentId);

    // Obtener el ID del torneo desde el código
    const tournamentFromCode = await getTournamentByCode(tournamentId);

    if(!tournamentFromCode) {
      console.error("No tournament found for the provided code:", tournamentId);
      return NextResponse.json({ error: "No tournament was found with the provided code." }, { status: 404 });
    }

    console.log("Tournament from code:", tournamentFromCode);

    const tournamentIdFromCode = tournamentFromCode.tournamentId;

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
        { error: "No participants were found for this tournament." },
        { status: 404 }
      );
    }

    console.log("Returning participants:", tournament);
    return NextResponse.json({ participants: tournament });
  } catch (error) {
    console.error("Unhandled error while fetching participants:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
