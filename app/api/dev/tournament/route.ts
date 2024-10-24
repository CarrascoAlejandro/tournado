import { NextResponse, type NextRequest } from 'next/server';
import { getTournament, insertTournament, getTournamentsByUser } from '@/lib/db';
import { auth } from '@/lib/auth';

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

export async function POST(request: NextRequest) {
  console.log('POST /api/dev/tournament');
  try {
    const session = await auth();
    const userMail = session?.user?.email
    // insert a new tournament
    if (!request.body) {
      return NextResponse.json({ message: 'Request body is missing' }, { status: 400 });
    }
    const body = await request.json();
    const nMaxParticipants = parseInt(body.nMaxParticipants, 10);
    const tournamentCode = (Math.floor(Math.random() * 90000000) + 10000000).toString();
    console.log('Request body:', body);
    await insertTournament(
      tournamentCode,
      body.tournamentName,
      body.status,
      body.startDate,
      body.endDate,
      nMaxParticipants,
      body.tags,
      userMail? userMail: "",
    );
    
    return NextResponse.json({ message: 'Tournament inserted successfully' });
  } catch (error) {
    console.error('Error inserting tournament:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}