import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectMember from '@/lib/models/ProjectMember';
import Project from '@/lib/models/Project';
import BoardMember from '@/lib/models/BoardMember';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/projects/[id]/members - Get all members for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const projectId = params.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get project members with populated member data
    const projectMembers = await ProjectMember.find({ projectId })
      .populate({
        path: 'memberId',
        select: 'name role roleType photoUrl photoBase64 bio socials displayOrder active'
      })
      .sort({ joinedAt: 1 })
      .lean();

    const formattedMembers = projectMembers.map((pm: any) => ({
      id: pm._id.toString(),
      projectId: pm.projectId.toString(),
      memberId: pm.memberId._id.toString(),
      role: pm.role as 'member' | 'coordinator',
      joinedAt: pm.joinedAt.toISOString(),
      member: {
        id: pm.memberId._id.toString(),
        name: pm.memberId.name,
        role: pm.memberId.role,
        roleType: pm.memberId.roleType,
        photoUrl: pm.memberId.photoUrl || '',
        photoBase64: pm.memberId.photoBase64 || '',
        bio: pm.memberId.bio || '',
        socials: pm.memberId.socials || '',
        displayOrder: pm.memberId.displayOrder,
        active: pm.memberId.active,
      }
    }));

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/projects/[id]/members - Add member to project
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const projectId = params.id;
    const { memberId, role } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    if (!role || !['member', 'coordinator'].includes(role)) {
      return NextResponse.json({ error: 'Role is required and must be either "member" or "coordinator"' }, { status: 400 });
    }

    // Verify project and member exist
    const [project, member] = await Promise.all([
      Project.findById(projectId),
      BoardMember.findById(memberId)
    ]);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await ProjectMember.findOne({ projectId, memberId });
    if (existingAssignment) {
      return NextResponse.json({ error: 'Member is already assigned to this project' }, { status: 409 });
    }

    // Create new assignment
    const projectMember = new ProjectMember({
      projectId,
      memberId,
      role: role as 'member' | 'coordinator',
    });

    const saved = await projectMember.save();

    // Return the formatted assignment
    const formattedAssignment = {
      id: saved._id.toString(),
      projectId: saved.projectId.toString(),
      memberId: saved.memberId.toString(),
      role: saved.role as 'member' | 'coordinator',
      joinedAt: saved.joinedAt.toISOString(),
      member: {
        id: (member as any)._id.toString(),
        name: member.name,
        role: member.role,
        roleType: member.roleType,
        photoUrl: member.photoUrl || '',
        photoBase64: member.photoBase64 || '',
        bio: member.bio || '',
        socials: member.socials || '',
        displayOrder: member.displayOrder,
        active: member.active,
      }
    };

    return NextResponse.json({ assignment: formattedAssignment }, { status: 201 });
  } catch (error) {
    console.error('Error adding member to project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/projects/[id]/members - Remove member from project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Remove the assignment
    const result = await ProjectMember.findOneAndDelete({ projectId, memberId });

    if (!result) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member from project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 