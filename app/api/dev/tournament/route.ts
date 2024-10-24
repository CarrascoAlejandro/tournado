import { NextResponse, type NextRequest } from 'next/server';
import { getTournament, getTournamentsByUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get('userEmail');
    if (!userEmail) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const tournaments = await getTournamentsByUser(userEmail);
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments by user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
