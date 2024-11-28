import { NextResponse, type NextRequest } from 'next/server';
import { getParticipantsByMatchId, getParticipantById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener el ID del match desde los parámetros de la URL
    const matchId = request.nextUrl.searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({ message: 'Match ID is required' }, { status: 400 });
    }

    // Convertir el ID a número y validar
    const matchIdNumber = parseInt(matchId, 10);
    if (isNaN(matchIdNumber)) {
      return NextResponse.json({ message: 'Invalid Match ID' }, { status: 400 });
    }

    // Obtener los participantes del match
    const participants = await getParticipantsByMatchId(matchIdNumber);
    // const participants = await getParticipantById(matchIdNumber);

    // Responder con los datos obtenidos
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants by match ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
