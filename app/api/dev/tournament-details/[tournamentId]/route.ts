// app/api/dev/tournament-details/[tournamentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTournamentByCode } from "@/lib/db"; // Método para obtener el torneo por código

export async function GET(
  req: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  console.log("API Request received for tournament details:", req.url);

  try {
    if (!params || !params.tournamentId) {
      console.error("Params are missing or invalid:", params);
      return NextResponse.json(
        { error: "The parameter 'tournamentId' is required." },
        { status: 400 }
      );
    }

    const { tournamentId } = params;
    console.log("Tournament ID received:", tournamentId);

    // Obtener los detalles del torneo por código
    const tournament = await getTournamentByCode(tournamentId);

    if (!tournament) {
      console.error("No tournament found for the provided code:", tournamentId);
      return NextResponse.json(
        { error: "No tournament was found with the provided code." },
        { status: 404 }
      );
    }

    console.log("Returning tournament details:", tournament);
    return NextResponse.json({ tournament });
  } catch (error) {
    console.error("Unhandled error while fetching tournament details:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
