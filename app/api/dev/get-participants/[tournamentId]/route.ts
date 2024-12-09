import { NextRequest, NextResponse } from "next/server";
import { db, participants, getTournamentByCode, getParticipantImageByParticipantId } from "@/lib/db"; 
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
        { error: "The parameter 'tournamentId' is required." },
        { status: 400 }
      );
    }

    const { tournamentId } = params;
    console.log("Tournament ID received:", tournamentId);

    
    const tournamentFromCode = await getTournamentByCode(tournamentId);

    if (!tournamentFromCode) {
      console.error(
        "No tournament found for the provided code:",
        tournamentId
      );
      return NextResponse.json(
        { error: "No tournament was found with the provided code." },
        { status: 404 }
      );
    }

    console.log("Tournament from code:", tournamentFromCode);

    const tournamentIdFromCode = tournamentFromCode.tournamentId;

    console.log(
      "Querying database for participants with tournament ID:",
      tournamentIdFromCode
    );
    const participantsList = await db
      .select()
      .from(participants)
      .where(eq(participants.tournamentId, tournamentIdFromCode));

    console.log("Database query result:", participantsList);

    if (participantsList.length === 0) {
      console.warn(
        "No participants found for the provided tournament ID:",
        tournamentIdFromCode
      );
      return NextResponse.json(
        { error: "No participants found for the provided tournament ID." },
        { status: 404 }
      );
    }

    
    const participantsWithImages = await Promise.all(
      participantsList.map(async (participant) => {
        const participantImageId = await getParticipantImageByParticipantId(
          participant.participantId
        );

        return {
          ...participant,
          participantImage: participantImageId, 
        };
      })
    );

    console.log("Returning participants with images:", participantsWithImages);

    return NextResponse.json({ participants: participantsWithImages });
  } catch (error) {
    console.error("Unhandled error while fetching participants:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
