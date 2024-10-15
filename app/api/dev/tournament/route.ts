import { NextResponse, type NextRequest } from 'next/server';
import { getTournament } from '@/lib/db';

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
