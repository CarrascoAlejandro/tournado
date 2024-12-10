import { NextResponse, type NextRequest } from 'next/server';
import { updateTournamentStatusByIdAndUserMail } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  console.log('PATCH /api/tournament/status');
  try {
    const session = await auth();
    const userMail = session?.user?.email;
    if (!userMail) {
      return NextResponse.json({ message: 'User is not authenticated' }, { status: 401 });
    }

    if (!request.body) {
      return NextResponse.json({ message: 'Request body is missing' }, { status: 400 });
    }

    const body = await request.json();
    const { tournamentId, newStatus } = body;

    if (!tournamentId || !newStatus) {
      return NextResponse.json({ message: 'Tournament ID and new status are required' }, { status: 400 });
    }

    await updateTournamentStatusByIdAndUserMail(tournamentId, userMail, newStatus);

    return NextResponse.json({ message: 'Tournament status updated successfully.' });
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}