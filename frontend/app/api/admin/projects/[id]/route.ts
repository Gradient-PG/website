import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { projectsRepo } from '@/lib/repositories';

// GET /api/admin/projects/[id] - Get single project
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
    const project = await projectsRepo.findById(params.id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PUT /api/admin/projects/[id] - Update project
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
    const projectData = await request.json();
    const project = await projectsRepo.update(params.id, projectData);
    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('Error updating project:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/admin/projects/[id] - Delete project
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
    await projectsRepo.delete(params.id);
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
} 