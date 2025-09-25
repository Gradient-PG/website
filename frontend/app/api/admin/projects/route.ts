import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { projectsRepo } from '@/lib/repositories';

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const projects = await projectsRepo.findAll();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
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

    // Generate slug if not provided
    if (!projectData.slug) {
      projectData.slug = await projectsRepo.generateSlug(projectData.title);
    }

    // Additional server-side checks
    if (projectData.slug) {
      // Check if slug already exists
      const existingProject = await projectsRepo.findBySlug(projectData.slug);
      if (existingProject) {
        return NextResponse.json(
          { error: 'A project with this URL slug already exists' },
          { status: 409 }
        );
      }
    }

    const project = await projectsRepo.create(projectData);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
} 