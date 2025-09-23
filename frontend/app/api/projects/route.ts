import { NextResponse } from 'next/server';
import { projectsRepo } from '@/lib/repositories';

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