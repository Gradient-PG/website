import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { boardMembersRepo } from '@/lib/repositories';
import { revalidatePath } from 'next/cache';

// GET /api/admin/board - List all board members
export async function GET(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const members = await boardMembersRepo.findAll();
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching board members:', error);
    return NextResponse.json({ error: 'Failed to fetch board members' }, { status: 500 });
  }
}

// POST /api/admin/board - Create new board member
export async function POST(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const memberData = await request.json();
    
    // Import validation function
    const { validateBoardMember } = await import('@/lib/validation');
    
    // Validate the board member data
    const validation = validateBoardMember(memberData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors,
          fieldErrors: validation.fieldErrors
        },
        { status: 400 }
      );
    }

    const member = await boardMembersRepo.create(memberData);
    
    // Revalidate pages that display board members
    revalidatePath('/board');
    revalidatePath('/');
    revalidatePath('/api/board');
    
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating board member:', error);
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create board member' }, { status: 500 });
  }
} 