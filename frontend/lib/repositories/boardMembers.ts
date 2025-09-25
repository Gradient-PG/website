import dbConnect from '../mongodb';
import BoardMember from '../models/BoardMember';
import { BoardMember as BoardMemberType, BoardMemberInput } from '../types';

export class BoardMembersRepository {
  // Ensure database connection
  private async ensureConnection() {
    await dbConnect();
  }

  // Convert MongoDB document to our BoardMember type
  private documentToBoardMember(doc: any): BoardMemberType {
    return {
      id: doc._id?.toString() || doc.id,
      name: doc.name,
      role: doc.role,
      roleType: doc.roleType || 'board_member', // Default to board_member for existing records
      photoUrl: doc.photoUrl || '',
      photoBase64: doc.photoBase64 || '',
      bio: doc.bio || '',
      socials: doc.socials || '',
      displayOrder: doc.displayOrder,
      active: doc.active,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt,
    };
  }

  // Get all board members, optionally filtered by active status
  async findAll(activeOnly: boolean = false): Promise<BoardMemberType[]> {
    await this.ensureConnection();
    
    const query = activeOnly ? { active: true } : {};
    const boardMembers = await BoardMember.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    
    return boardMembers.map(doc => this.documentToBoardMember(doc));
  }

  // Get active board members for public display
  async findActive(): Promise<BoardMemberType[]> {
    return this.findAll(true);
  }

  // Get board members by role type
  async findByRoleType(roleType: 'board_member' | 'coordinator', activeOnly: boolean = false): Promise<BoardMemberType[]> {
    await this.ensureConnection();
    
    const filter: any = { roleType };
    if (activeOnly) {
      filter.active = true;
    }

    const members = await BoardMember.find(filter)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return members.map(member => this.documentToBoardMember(member));
  }

  // Get board members grouped by role type
  async findGroupedByRoleType(activeOnly: boolean = false): Promise<{
    boardMembers: BoardMemberType[];
    coordinators: BoardMemberType[];
  }> {
    const [boardMembers, coordinators] = await Promise.all([
      this.findByRoleType('board_member', activeOnly),
      this.findByRoleType('coordinator', activeOnly),
    ]);

    return { boardMembers, coordinators };
  }

  // Get a board member by ID
  async findById(id: string): Promise<BoardMemberType | null> {
    await this.ensureConnection();
    
    const member = await BoardMember.findById(id).lean();
    if (!member) return null;
    
    return this.documentToBoardMember(member);
  }

  // Create a new board member
  async create(memberData: BoardMemberInput): Promise<BoardMemberType> {
    await this.ensureConnection();

    const member = new BoardMember({
      name: memberData.name,
      role: memberData.role,
      roleType: memberData.roleType || 'board_member',
      photoUrl: memberData.photoUrl || '',
      photoBase64: memberData.photoBase64 || '',
      bio: memberData.bio || '',
      socials: memberData.socials || '',
      displayOrder: memberData.displayOrder || 0,
      active: memberData.active !== undefined ? memberData.active : true,
    });

    const savedMember = await member.save();
    return this.documentToBoardMember(savedMember.toObject());
  }

  // Update an existing board member
  async update(id: string, memberData: Partial<BoardMemberInput>): Promise<BoardMemberType> {
    await this.ensureConnection();

    const updatedMember = await BoardMember.findByIdAndUpdate(
      id,
      { ...memberData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      throw new Error(`Board member with ID ${id} not found`);
    }

    return this.documentToBoardMember(updatedMember.toObject());
  }

  // Delete a board member
  async delete(id: string): Promise<void> {
    await this.ensureConnection();
    
    const deletedMember = await BoardMember.findByIdAndDelete(id);
    if (!deletedMember) {
      throw new Error(`Board member with ID ${id} not found`);
    }
  }

  // Soft delete (set active to false)
  async deactivate(id: string): Promise<BoardMemberType> {
    return this.update(id, { active: false });
  }

  // Reactivate a board member
  async activate(id: string): Promise<BoardMemberType> {
    return this.update(id, { active: true });
  }

  // Get board members by role
  async findByRole(role: string): Promise<BoardMemberType[]> {
    await this.ensureConnection();
    
    const members = await BoardMember.find({ role, active: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return members.map(doc => this.documentToBoardMember(doc));
  }

  // Get current leadership (President, Vice President, etc.)
  async findLeadership(): Promise<BoardMemberType[]> {
    await this.ensureConnection();
    
    const leadershipRoles = ['President', 'Vice President', 'Secretary', 'Treasurer'];
    
    const members = await BoardMember.find({ 
      role: { $in: leadershipRoles }, 
      active: true 
    }).lean();

    // Sort by role hierarchy
    const sortedMembers = members.sort((a, b) => {
      const roleOrder = {
        'President': 1,
        'Vice President': 2,
        'Secretary': 3,
        'Treasurer': 4
      };
      
      const aOrder = roleOrder[a.role as keyof typeof roleOrder] || 5;
      const bOrder = roleOrder[b.role as keyof typeof roleOrder] || 5;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      return a.displayOrder - b.displayOrder;
    });

    return sortedMembers.map(doc => this.documentToBoardMember(doc));
  }

  // Reorder board members
  async updateDisplayOrder(memberOrders: { id: string; displayOrder: number }[]): Promise<void> {
    await this.ensureConnection();
    
    for (const { id, displayOrder } of memberOrders) {
      await BoardMember.findByIdAndUpdate(
        id,
        { displayOrder, updatedAt: new Date() }
      );
    }
  }
}

// Export a singleton instance
export const boardMembersRepo = new BoardMembersRepository(); 