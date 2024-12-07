import { NextResponse, type NextRequest } from 'next/server';
import { getParticipantById, getParticipantImageByParticipantId } from '@/lib/db';

export async function GET(request: NextRequest,
    { params }: { params: { participantId: number } }
) {
  try {
    const { participantId } = params;

    // Obtener datos del participante
    const participant = await getParticipantById(participantId);
    if (!participant) {
      return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
    }

    // Obtener imagen del participante
    const img = await getParticipantImageByParticipantId(participant.participantId);

    // Agregar la imagen al objeto del participante
    const participantWithImage = {
      ...participant,
      img, // Agregar el atributo de imagen
    };

    // Responder con los datos obtenidos
    return NextResponse.json(participantWithImage);
  } catch (error) {
    console.error('Error fetching participant data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
