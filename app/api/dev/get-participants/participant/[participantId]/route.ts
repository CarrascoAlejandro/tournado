import { NextResponse, type NextRequest } from 'next/server';
import { getParticipantById } from '@/lib/db';

export async function GET(request: NextRequest,
    { params }: { params: { participantId: number } }
) {
  try {
    // Obtener el ID del match desde los parámetros de la URL
    // const matchId = request.nextUrl.searchParams.get('matchId');
    // const userEmail = request.nextUrl.searchParams.get('userEmail');

    // if (!matchId) {
    //   return NextResponse.json({ message: 'Match ID is required' }, { status: 400 });
    // }

    // Convertir el ID a número y validar
    // const matchIdNumber = parseInt(matchId, 10);
    const { participantId } = params;
    // if (isNaN(matchId)) {
    //   return NextResponse.json({ message: 'Invalid Match ID' }, { status: 400 });
    // }

    // Obtener los participantes del match
    // const participants = await getParticipantsByMatchId(matchId);
    const participants = await getParticipantById(participantId);

    // Responder con los datos obtenidos
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants by match ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
