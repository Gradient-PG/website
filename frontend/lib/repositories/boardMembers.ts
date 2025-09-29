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
      role: doc.role || undefined, // Explicitly handle missing role field
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
  async findByRoleType(roleType: 'board_member' | 'coordinator' | 'member', activeOnly: boolean = false): Promise<BoardMemberType[]> {
    await this.ensureConnection();
    
    const filter: any = { roleType };
    if (activeOnly) {
      filter.active = true;
    }

    const boardMembers = await BoardMember.find(filter)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    
    return boardMembers.map(doc => this.documentToBoardMember(doc));
  }

  // Get board members grouped by role type
  async findGroupedByRoleType(activeOnly: boolean = false): Promise<{
    boardMembers: BoardMemberType[];
    coordinators: BoardMemberType[];
    members: BoardMemberType[];
  }> {
    const [boardMembers, coordinators, members] = await Promise.all([
      this.findByRoleType('board_member', activeOnly),
      this.findByRoleType('coordinator', activeOnly),
      this.findByRoleType('member', activeOnly),
    ]);

    return { boardMembers, coordinators, members };
  }

  // Get statistics by role type
  async getStatsByRoleType(): Promise<{
    boardMembers: { total: number; active: number };
    coordinators: { total: number; active: number };
    members: { total: number; active: number };
    total: { total: number; active: number };
  }> {
    await this.ensureConnection();

    const [
      totalBoardMembers,
      activeBoardMembers,
      totalCoordinators,
      activeCoordinators,
      totalMembers,
      activeMembers,
      totalAll,
      activeAll,
    ] = await Promise.all([
      BoardMember.countDocuments({ roleType: 'board_member' }),
      BoardMember.countDocuments({ roleType: 'board_member', active: true }),
      BoardMember.countDocuments({ roleType: 'coordinator' }),
      BoardMember.countDocuments({ roleType: 'coordinator', active: true }),
      BoardMember.countDocuments({ roleType: 'member' }),
      BoardMember.countDocuments({ roleType: 'member', active: true }),
      BoardMember.countDocuments({}),
      BoardMember.countDocuments({ active: true }),
    ]);

    return {
      boardMembers: { total: totalBoardMembers, active: activeBoardMembers },
      coordinators: { total: totalCoordinators, active: activeCoordinators },
      members: { total: totalMembers, active: activeMembers },
      total: { total: totalAll, active: activeAll },
    };
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

    // Prepare member data, excluding empty role field
    const memberDoc: any = {
      name: memberData.name,
      roleType: memberData.roleType || 'board_member',
      photoUrl: memberData.photoUrl || '',
      photoBase64: memberData.photoBase64 || '',
      bio: memberData.bio || '',
      socials: memberData.socials || '',
      displayOrder: memberData.displayOrder || 0,
      active: true, // Default to active for new members
    };

    // Only include role if it's not empty
    if (memberData.role && memberData.role.trim() !== '') {
      memberDoc.role = memberData.role;
    }

    const member = new BoardMember(memberDoc);
    const savedMember = await member.save();
    return this.documentToBoardMember(savedMember.toObject());
  }

  // Update an existing board member
  async update(id: string, memberData: Partial<BoardMemberInput>): Promise<BoardMemberType> {
    await this.ensureConnection();

    // Prepare update operations
    const updateData: any = { ...memberData, updatedAt: new Date() };
    const unsetData: any = {};
    
    // Handle role field - if empty, unset it completely
    if (memberData.role === '' || memberData.role === null || memberData.role === undefined) {
      delete updateData.role; // Remove from update data
      unsetData.role = ""; // Add to unset operation
    }

    // Build the update query
    const updateQuery: any = {};
    if (Object.keys(updateData).length > 0) {
      updateQuery.$set = updateData;
    }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    const updatedMember = await BoardMember.findByIdAndUpdate(
      id,
      updateQuery,
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
    await this.ensureConnection();

    const updatedMember = await BoardMember.findByIdAndUpdate(
      id,
      { active: false, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      throw new Error(`Board member with ID ${id} not found`);
    }

    return this.documentToBoardMember(updatedMember.toObject());
  }

  // Reactivate a board member
  async activate(id: string): Promise<BoardMemberType> {
    await this.ensureConnection();

    const updatedMember = await BoardMember.findByIdAndUpdate(
      id,
      { active: true, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      throw new Error(`Board member with ID ${id} not found`);
    }

    return this.documentToBoardMember(updatedMember.toObject());
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