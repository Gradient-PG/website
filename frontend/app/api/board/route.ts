import { NextResponse } from 'next/server';
import { boardMembersRepo } from '@/lib/repositories';

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