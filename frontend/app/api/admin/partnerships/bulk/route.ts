import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { partnershipsRepo } from '@/lib/repositories/partnerships';
import { revalidatePath } from 'next/cache';

// POST /api/admin/partnerships/bulk - Bulk operations on partnerships
export async function POST(request: NextRequest) {
  // Validate authentication
  const auth = await requireAdminAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { action, partnershipIds, data } = await request.json();

    if (!action || !partnershipIds || !Array.isArray(partnershipIds)) {
      return NextResponse.json(
        { error: 'Action and partnershipIds array are required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      errors: [] as { id: string; error: string }[],
    };

    switch (action) {
      case 'delete':
        for (const partnershipId of partnershipIds) {
          try {
            await partnershipsRepo.delete(partnershipId);
            results.success.push(partnershipId);
          } catch (error) {
            results.errors.push({
              id: partnershipId,
              error: error instanceof Error ? error.message : 'Failed to delete',
            });
          }
        }
        break;

      case 'updateStatus':
        if (data?.active === undefined) {
          return NextResponse.json(
            { error: 'Status (active) is required for updateStatus action' },
            { status: 400 }
          );
        }

        for (const partnershipId of partnershipIds) {
          try {
            await partnershipsRepo.update(partnershipId, { active: data.active });
            results.success.push(partnershipId);
          } catch (error) {
            results.errors.push({
              id: partnershipId,
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

        try {
          await partnershipsRepo.updateDisplayOrders(data.updates);
          results.success.push(...partnershipIds);
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to update display orders' },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Revalidate homepage
    revalidatePath('/');

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in bulk partnership operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
} 