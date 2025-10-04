import { NextResponse } from 'next/server';
import { boardMembersRepo } from '@/lib/repositories';

// Set revalidation to 60 seconds to ensure fresh data
export const revalidate = 60;

export async function GET() {
  try {
    const boardMembers = await boardMembersRepo.findActive();
    return NextResponse.json(boardMembers);
  } catch (error) {
    console.error('Error fetching board members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board members' },
      { status: 500 }
    );
  }
} 