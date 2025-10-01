import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { partnershipsRepo } from '@/lib/repositories/partnerships';
import { revalidatePath } from 'next/cache';

// GET /api/admin/partnerships - List all partnerships
export async function GET(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const partnerships = await partnershipsRepo.findAll();
    return NextResponse.json({ partnerships });
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 });
  }
}

// POST /api/admin/partnerships - Create new partnership
export async function POST(request: NextRequest) {
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

    const partnership = await partnershipsRepo.create(partnershipData);
    
    // Revalidate homepage
    revalidatePath('/');
    
    return NextResponse.json({ partnership }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating partnership:', error);
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 });
  }
} 