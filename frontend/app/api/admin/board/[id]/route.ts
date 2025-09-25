import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { boardMembersRepo } from '@/lib/repositories';

// GET /api/admin/board/[id] - Get board member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const member = await boardMembersRepo.findById(params.id);
    
    if (!member) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error fetching board member:', error);
    return NextResponse.json({ error: 'Failed to fetch board member' }, { status: 500 });
  }
}

// PUT /api/admin/board/[id] - Update board member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const member = await boardMembersRepo.update(params.id, memberData);
    return NextResponse.json({ member });
  } catch (error: any) {
    console.error('Error updating board member:', error);
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update board member' }, { status: 500 });
  }
}

// DELETE /api/admin/board/[id] - Delete board member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    await boardMembersRepo.delete(params.id);
    return NextResponse.json({ message: 'Board member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting board member:', error);
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Board member not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete board member' }, { status: 500 });
  }
} 