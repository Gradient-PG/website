import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { partnershipsRepo } from '@/lib/repositories/partnerships';
import { revalidatePath } from 'next/cache';

// GET /api/admin/partnerships/[id] - Get partnership by ID
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
    const partnership = await partnershipsRepo.findById(params.id);
    
    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    return NextResponse.json({ partnership });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json({ error: 'Failed to fetch partnership' }, { status: 500 });
  }
}

// PUT /api/admin/partnerships/[id] - Update partnership
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
    const partnershipData = await request.json();

    // Basic validation
    if (!partnershipData.name || !partnershipData.yearFrom) {
      return NextResponse.json(
        { error: 'Name and starting year are required' },
        { status: 400 }
      );
    }

    // Validate year range
    if (partnershipData.yearTo && partnershipData.yearTo < partnershipData.yearFrom) {
      return NextResponse.json(
        { error: 'End year must be greater than or equal to start year' },
        { status: 400 }
      );
    }

    const partnership = await partnershipsRepo.update(params.id, partnershipData);
    
    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }
    
    // Revalidate homepage
    revalidatePath('/');
    
    return NextResponse.json({ partnership });
  } catch (error: any) {
    console.error('Error updating partnership:', error);
    return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 });
  }
}

// DELETE /api/admin/partnerships/[id] - Delete partnership
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
    await partnershipsRepo.delete(params.id);
    
    // Revalidate homepage
    revalidatePath('/');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    return NextResponse.json({ error: 'Failed to delete partnership' }, { status: 500 });
  }
} 