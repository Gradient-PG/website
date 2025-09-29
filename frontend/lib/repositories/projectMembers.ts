import dbConnect from '../mongodb';
import ProjectMember from '../models/ProjectMember';
import { ProjectMemberAssignment, ProjectMemberInput } from '../types';

export class ProjectMembersRepository {
  // Ensure database connection
  private async ensureConnection() {
    await dbConnect();
  }

  // Convert MongoDB document to our ProjectMemberAssignment type
  private documentToProjectMember(doc: any): ProjectMemberAssignment {
    return {
      id: doc._id?.toString() || doc.id,
      projectId: doc.projectId?.toString() || doc.projectId,
      memberId: doc.memberId?.toString() || doc.memberId,
      role: doc.role || '',
      joinedAt: doc.joinedAt?.toISOString ? doc.joinedAt.toISOString() : doc.joinedAt,
      // Populated fields will be added if they exist
      project: doc.project ? {
        id: doc.project._id?.toString() || doc.project.id,
        title: doc.project.title,
        slug: doc.project.slug,
        description: doc.project.description,
        imageUrl: doc.project.imageUrl || '',
        imageBase64: doc.project.imageBase64 || '',
        tags: doc.project.tags || '',
        status: doc.project.status,
        links: doc.project.links || '',
        displayOrder: doc.project.displayOrder,
        createdAt: doc.project.createdAt?.toISOString ? doc.project.createdAt.toISOString() : doc.project.createdAt,
        updatedAt: doc.project.updatedAt?.toISOString ? doc.project.updatedAt.toISOString() : doc.project.updatedAt,
      } : undefined,
      member: doc.member ? {
        id: doc.member._id?.toString() || doc.member.id,
        name: doc.member.name,
        role: doc.member.role,
        roleType: doc.member.roleType,
        photoUrl: doc.member.photoUrl || '',
        photoBase64: doc.member.photoBase64 || '',
        bio: doc.member.bio || '',
        socials: doc.member.socials || '',
        displayOrder: doc.member.displayOrder,
        active: doc.member.active,
        createdAt: doc.member.createdAt?.toISOString ? doc.member.createdAt.toISOString() : doc.member.createdAt,
        updatedAt: doc.member.updatedAt?.toISOString ? doc.member.updatedAt.toISOString() : doc.member.updatedAt,
      } : undefined,
    };
  }

  // Add a member to a project
  async assignMemberToProject(data: ProjectMemberInput): Promise<ProjectMemberAssignment> {
    await this.ensureConnection();
    
    try {
      const projectMember = new ProjectMember({
        projectId: data.projectId,
        memberId: data.memberId,
        role: data.role,
      });
      
      const saved = await projectMember.save();
      return this.documentToProjectMember(saved.toObject());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Member is already assigned to this project');
      }
      throw error;
    }
  }

  // Remove a member from a project
  async removeMemberFromProject(projectId: string, memberId: string): Promise<boolean> {
    await this.ensureConnection();
    
    try {
      const result = await ProjectMember.findOneAndDelete({
        projectId,
        memberId,
      });
      
      return result !== null;
    } catch (error) {
      console.error('Error removing member from project:', error);
      return false;
    }
  }

  // Get all members for a specific project
  async getProjectMembers(projectId: string): Promise<ProjectMemberAssignment[]> {
    await this.ensureConnection();
    
    try {
      const projectMembers = await ProjectMember.find({ projectId })
        .populate({
          path: 'memberId',
          select: 'name role roleType photoUrl photoBase64 bio socials displayOrder active createdAt updatedAt'
        })
        .sort({ joinedAt: 1 })
        .lean();
      
      return projectMembers.map(doc => this.documentToProjectMember({
        ...doc,
        member: doc.memberId,
      }));
    } catch (error) {
      console.error('Error getting project members:', error);
      return [];
    }
  }

  // Get all projects for a specific member
  async getMemberProjects(memberId: string): Promise<ProjectMemberAssignment[]> {
    await this.ensureConnection();
    
    try {
      const memberProjects = await ProjectMember.find({ memberId })
        .populate({
          path: 'projectId',
          select: 'title slug description imageUrl imageBase64 tags status links displayOrder createdAt updatedAt'
        })
        .sort({ joinedAt: 1 })
        .lean();
      
      return memberProjects.map(doc => this.documentToProjectMember({
        ...doc,
        project: doc.projectId,
      }));
    } catch (error) {
      console.error('Error getting member projects:', error);
      return [];
    }
  }

  // Update member role in a project
  async updateMemberRole(projectId: string, memberId: string, role: string): Promise<ProjectMemberAssignment | null> {
    await this.ensureConnection();
    
    try {
      const updated = await ProjectMember.findOneAndUpdate(
        { projectId, memberId },
        { role },
        { new: true }
      ).lean();
      
      if (!updated) {
        return null;
      }
      
      return this.documentToProjectMember(updated);
    } catch (error) {
      console.error('Error updating member role:', error);
      return null;
    }
  }

  // Get all project-member relationships
  async findAll(): Promise<ProjectMemberAssignment[]> {
    await this.ensureConnection();
    
    try {
      const projectMembers = await ProjectMember.find({})
        .populate({
          path: 'projectId',
          select: 'title slug description imageUrl imageBase64 tags status links displayOrder createdAt updatedAt'
        })
        .populate({
          path: 'memberId',
          select: 'name role roleType photoUrl photoBase64 bio socials displayOrder active createdAt updatedAt'
        })
        .sort({ joinedAt: 1 })
        .lean();
      
      return projectMembers.map(doc => this.documentToProjectMember({
        ...doc,
        project: doc.projectId,
        member: doc.memberId,
      }));
    } catch (error) {
      console.error('Error getting all project members:', error);
      return [];
    }
  }

  // Bulk assign members to project
  async bulkAssignMembersToProject(projectId: string, memberData: Array<{ memberId: string; role?: string }>): Promise<ProjectMemberAssignment[]> {
    await this.ensureConnection();
    
    try {
      const assignments = memberData.map(data => new ProjectMember({
        projectId,
        memberId: data.memberId,
        role: data.role,
      }));
      
      // Save individually to handle duplicates gracefully
      const results: ProjectMemberAssignment[] = [];
      for (const assignment of assignments) {
        try {
          const saved = await assignment.save();
          results.push(this.documentToProjectMember(saved.toObject()));
        } catch (error: any) {
          if (error.code !== 11000) { // Skip duplicate key errors
            console.error('Error in bulk assign:', error);
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk assigning members:', error);
      return [];
    }
  }

  // Remove all members from a project
  async removeAllMembersFromProject(projectId: string): Promise<number> {
    await this.ensureConnection();
    
    try {
      const result = await ProjectMember.deleteMany({ projectId });
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error removing all members from project:', error);
      return 0;
    }
  }
}

export const projectMembersRepo = new ProjectMembersRepository(); 