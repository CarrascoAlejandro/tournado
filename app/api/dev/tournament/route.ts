import { NextResponse, type NextRequest } from 'next/server';
import { getTournament, insertTournament } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('GET /api/dev/tournament');
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const offset = searchParams.get('offset') || '0';
    const tournamentsData = await getTournament(String(search), parseInt(offset, 10));
    return NextResponse.json(tournamentsData);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
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
      new Date(body.startDate),
      new Date(body.endDate),
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