import { NextResponse } from 'next/server';
import { projectsRepo } from '@/lib/repositories';

// Set revalidation to 60 seconds to ensure fresh data
export const revalidate = 60;

export async function GET() {
  try {
    const projects = await projectsRepo.findAll();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 