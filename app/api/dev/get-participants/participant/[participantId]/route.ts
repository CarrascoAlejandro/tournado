import { NextResponse, type NextRequest } from 'next/server';
import { getParticipantById, getParticipantImageByParticipantId, deleteParticipantById } from '@/lib/db';

export async function GET(request: NextRequest,
    { params }: { params: { participantId: number } }
) {
  try {
    const { participantId } = params;

    
    const participant = await getParticipantById(participantId);
    if (!participant) {
      return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
    }

    
    const img = await getParticipantImageByParticipantId(participant.participantId);

    
    const participantWithImage = {
      ...participant,
      img, 
    };

    
    return NextResponse.json(participantWithImage);
  } catch (error) {
    console.error('Error fetching participant data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, 
  { params }: { params: { participantId: number } }) {
try {
  const { participantId } = params;

  
  const participant = await getParticipantById(participantId);
  if (!participant) {
    return NextResponse.json({ message: 'Participant not found' }, { status: 404 });
  }

  
  await deleteParticipantById(participantId);

  
  return NextResponse.json({ message: `Participant with ID ${participantId} successfully deleted` });
} catch (error) {
  console.error('Error deleting participant:', error);
  return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
}
}