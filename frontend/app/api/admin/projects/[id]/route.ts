import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { projectsRepo } from '@/lib/repositories';
import { revalidatePath } from 'next/cache';

// GET /api/admin/projects/[id] - Get project by ID
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
    
    // Import validation function
    const { validateProject } = await import('@/lib/validation');
    
    // Validate the project data
    const validation = validateProject(projectData);
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

    // Additional server-side checks for slug uniqueness
    if (projectData.slug) {
      const existingProject = await projectsRepo.findBySlug(projectData.slug);
      if (existingProject && existingProject.id !== params.id) {
        return NextResponse.json(
          { error: 'A project with this URL slug already exists' },
          { status: 409 }
        );
      }
    }

    const project = await projectsRepo.update(params.id, projectData);
    
    // Revalidate pages that display projects
    revalidatePath('/projects');
    revalidatePath('/');
    revalidatePath('/api/projects');
    revalidatePath(`/projects/${project.slug}`); // Also revalidate the specific project page
    
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
    
    // Revalidate pages that display projects
    revalidatePath('/projects');
    revalidatePath('/');
    revalidatePath('/api/projects');
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
} 