// Migration script to update existing board members with roleType field
// Run this with: node scripts/migrate-member-types.js

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gradient');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define the schema (temporary for migration)
const BoardMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  roleType: {
    type: String,
    enum: ['board_member', 'coordinator', 'member'],
    default: 'member'
  },
  photoUrl: String,
  photoBase64: String,
  bio: String,
  socials: String,
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const BoardMember = mongoose.model('BoardMember', BoardMemberSchema);

async function migrateMemberTypes() {
  try {
    console.log('Starting migration...');
    
    // Update all members without roleType to 'member'
    const result1 = await BoardMember.updateMany(
      { roleType: { $exists: false } },
      { $set: { roleType: 'member' } }
    );
    console.log(`Updated ${result1.modifiedCount} members without roleType to 'member'`);
    
    // Update members with null roleType to 'member'
    const result2 = await BoardMember.updateMany(
      { roleType: null },
      { $set: { roleType: 'member' } }
    );
    console.log(`Updated ${result2.modifiedCount} members with null roleType to 'member'`);
    
    // Show current distribution
    const stats = await BoardMember.aggregate([
      { $group: { _id: '$roleType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nCurrent member type distribution:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
async function main() {
  await connectDB();
  await migrateMemberTypes();
}

main().catch(console.error); 