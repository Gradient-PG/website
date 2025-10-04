import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { projectsRepo } from '@/lib/repositories';
import { revalidatePath } from 'next/cache';

// POST /api/admin/projects/bulk - Bulk operations on projects
export async function POST(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { action, projectIds, data } = await request.json();

    if (!action || !projectIds || !Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: 'Action and projectIds array are required' },
        { status: 400 }
      );
    }

    if (projectIds.length === 0) {
      return NextResponse.json(
        { error: 'No projects selected' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      errors: [] as { id: string; error: string }[],
    };

    switch (action) {
      case 'delete':
        for (const projectId of projectIds) {
          try {
            await projectsRepo.delete(projectId);
            results.success.push(projectId);
          } catch (error) {
            results.errors.push({
              id: projectId,
              error: error instanceof Error ? error.message : 'Failed to delete',
            });
          }
        }
        break;

      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Status is required for updateStatus action' },
            { status: 400 }
          );
        }

        for (const projectId of projectIds) {
          try {
            await projectsRepo.update(projectId, { status: data.status });
            results.success.push(projectId);
          } catch (error) {
            results.errors.push({
              id: projectId,
              error: error instanceof Error ? error.message : 'Failed to update status',
            });
          }
        }
        break;

      case 'updateDisplayOrder':
        if (!data?.updates || !Array.isArray(data.updates)) {
          return NextResponse.json(
            { error: 'Updates array is required for updateDisplayOrder action' },
            { status: 400 }
          );
        }

        for (const update of data.updates) {
          try {
            await projectsRepo.update(update.id, { displayOrder: update.displayOrder });
            results.success.push(update.id);
          } catch (error) {
            results.errors.push({
              id: update.id,
              error: error instanceof Error ? error.message : 'Failed to update display order',
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Revalidate pages that display projects if any operations succeeded
    if (results.success.length > 0) {
      revalidatePath('/projects');
      revalidatePath('/');
      revalidatePath('/api/projects');
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      results,
      summary: {
        total: projectIds.length,
        successful: results.success.length,
        failed: results.errors.length,
      },
    });
  } catch (error) {
    console.error('Error processing bulk operation:', error);
    return NextResponse.json({ error: 'Failed to process bulk operation' }, { status: 500 });
  }
} 