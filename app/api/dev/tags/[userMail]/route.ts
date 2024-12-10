import { NextResponse, type NextRequest } from 'next/server';
import { getTagsByUserMail } from '@/lib/db'; // Adjust the path to your database function

export async function GET(
  request: NextRequest,
  { params }: { params: { userMail: string } }
) {
  try {
    const { userMail } = params;

    // Validate the userMail parameter
    if (!userMail) {
      return NextResponse.json(
        { message: 'User mail is required' },
        { status: 400 }
      );
    }

    // Fetch tags by user mail
    const tags = await getTagsByUserMail(userMail);

    // Respond with the tags
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags by user mail:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
