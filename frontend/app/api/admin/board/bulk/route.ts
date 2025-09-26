import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { boardMembersRepo } from '@/lib/repositories';
import { revalidatePath } from 'next/cache';

// POST /api/admin/board/bulk - Bulk operations on board members
export async function POST(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { action, memberIds } = await request.json();

    if (!action || !memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Action and memberIds array are required' },
        { status: 400 }
      );
    }

    if (memberIds.length === 0) {
      return NextResponse.json(
        { error: 'No board members selected' },
        { status: 400 }
      );
    }

    let results = [];

    switch (action) {
      case 'delete':
        for (const id of memberIds) {
          try {
            await boardMembersRepo.delete(id);
            results.push({ id, success: true });
          } catch (error) {
            console.error(`Error deleting board member ${id}:`, error);
            results.push({ id, success: false, error: 'Failed to delete' });
          }
        }
        break;

      case 'activate':
        for (const id of memberIds) {
          try {
            await boardMembersRepo.activate(id);
            results.push({ id, success: true });
          } catch (error) {
            console.error(`Error activating board member ${id}:`, error);
            results.push({ id, success: false, error: 'Failed to activate' });
          }
        }
        break;

      case 'deactivate':
        for (const id of memberIds) {
          try {
            await boardMembersRepo.deactivate(id);
            results.push({ id, success: true });
          } catch (error) {
            console.error(`Error deactivating board member ${id}:`, error);
            results.push({ id, success: false, error: 'Failed to deactivate' });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Revalidate pages that display board members if any operations succeeded
    if (successCount > 0) {
      revalidatePath('/board');
      revalidatePath('/');
      revalidatePath('/api/board');
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      results,
      summary: {
        total: memberIds.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Error processing bulk operation:', error);
    return NextResponse.json({ error: 'Failed to process bulk operation' }, { status: 500 });
  }
} 