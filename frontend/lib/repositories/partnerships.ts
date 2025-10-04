import dbConnect from '../mongodb';
import Partnership from '../models/Partnership';
import { Partnership as PartnershipType, PartnershipInput } from '../types';

export class PartnershipsRepository {
  // Ensure database connection
  private async ensureConnection() {
    await dbConnect();
  }

  // Convert MongoDB document to our Partnership type
  private documentToPartnership(doc: any): PartnershipType {
    return {
      id: doc._id?.toString() || doc.id,
      name: doc.name,
      websiteUrl: doc.websiteUrl || '',
      logoUrl: doc.logoUrl || '',
      logoBase64: doc.logoBase64 || '',
      yearFrom: doc.yearFrom,
      yearTo: doc.yearTo,
      displayOrder: doc.displayOrder,
      active: doc.active,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt,
    };
  }

  // Get all partnerships, optionally filtered by active status
  async findAll(activeOnly: boolean = false): Promise<PartnershipType[]> {
    await this.ensureConnection();
    
    const query = activeOnly ? { active: true } : {};
    const partnerships = await Partnership.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    
    return partnerships.map(doc => this.documentToPartnership(doc));
  }

  // Get active partnerships for public display
  async findActive(): Promise<PartnershipType[]> {
    return this.findAll(true);
  }

  // Get a single partnership by ID
  async findById(id: string): Promise<PartnershipType | null> {
    await this.ensureConnection();
    
    const partnership = await Partnership.findById(id).lean();
    if (!partnership) return null;
    
    return this.documentToPartnership(partnership);
  }

  // Create a new partnership
  async create(data: PartnershipInput): Promise<PartnershipType> {
    await this.ensureConnection();
    
    const partnership = new Partnership(data);
    const savedPartnership = await partnership.save();
    
    return this.documentToPartnership(savedPartnership);
  }

  // Update an existing partnership
  async update(id: string, data: Partial<PartnershipInput>): Promise<PartnershipType | null> {
    await this.ensureConnection();
    
    const partnership = await Partnership.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    if (!partnership) return null;
    
    return this.documentToPartnership(partnership);
  }

  // Delete a partnership
  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    const result = await Partnership.findByIdAndDelete(id);
    return !!result;
  }

  // Update display orders for multiple partnerships
  async updateDisplayOrders(updates: { id: string; displayOrder: number }[]): Promise<void> {
    await this.ensureConnection();
    
    const bulkOps = updates.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder } }
      }
    }));
    
    if (bulkOps.length > 0) {
      await Partnership.bulkWrite(bulkOps);
    }
  }

  // Get count of partnerships
  async count(activeOnly: boolean = false): Promise<number> {
    await this.ensureConnection();
    
    const query = activeOnly ? { active: true } : {};
    return await Partnership.countDocuments(query);
  }
}

// Export a singleton instance
export const partnershipsRepo = new PartnershipsRepository(); 