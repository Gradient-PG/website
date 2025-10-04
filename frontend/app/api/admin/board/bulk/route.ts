import { NextRequest, NextResponse } from 'next/server';
import { boardMembersRepo } from '@/lib/repositories/boardMembers';
import { requireAdminAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, memberIds, data } = body;

    if (!action || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and memberIds array are required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      errors: [] as { id: string; error: string }[],
    };

    switch (action) {
      case 'delete':
        for (const memberId of memberIds) {
          try {
            await boardMembersRepo.delete(memberId);
            results.success.push(memberId);
          } catch (error) {
            results.errors.push({
              id: memberId,
              error: error instanceof Error ? error.message : 'Failed to delete',
            });
          }
        }
        break;

      case 'updateStatus':
        if (typeof data?.active !== 'boolean') {
          return NextResponse.json(
            { error: 'Active status (boolean) is required for updateStatus action' },
            { status: 400 }
          );
        }

        for (const memberId of memberIds) {
          try {
            await boardMembersRepo.update(memberId, { active: data.active });
            results.success.push(memberId);
          } catch (error) {
            results.errors.push({
              id: memberId,
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
            await boardMembersRepo.update(update.id, { displayOrder: update.displayOrder });
            results.success.push(update.id);
          } catch (error) {
            results.errors.push({
              id: update.id,
              error: error instanceof Error ? error.message : 'Failed to update display order',
            });
          }
        }
        break;

      case 'updateRoleType':
        if (!data?.roleType || !['board_member', 'coordinator', 'member'].includes(data.roleType)) {
          return NextResponse.json(
            { error: 'Valid roleType (board_member, coordinator, or member) is required for updateRoleType action' },
            { status: 400 }
          );
        }

        for (const memberId of memberIds) {
          try {
            await boardMembersRepo.update(memberId, { roleType: data.roleType });
            results.success.push(memberId);
          } catch (error) {
            results.errors.push({
              id: memberId,
              error: error instanceof Error ? error.message : 'Failed to update role type',
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

    // Revalidate pages that display board members if any operations succeeded
    if (results.success.length > 0) {
      try {
      revalidatePath('/board');
        revalidatePath('/admin/board');
      revalidatePath('/');
      } catch (revalidateError) {
        console.warn('Failed to revalidate paths:', revalidateError);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk board member operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 