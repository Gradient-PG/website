#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from multiple possible locations
const envPaths = [
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    config({ path: envPath });
    console.log(`📁 Loaded environment from: ${envPath}`);
    break;
  }
}

import { adminAuthRepo } from '../lib/repositories/adminAuth';

async function createAdminUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npm run create-admin <username> <password> [email]');
    console.log('Example: npm run create-admin admin mypassword123 admin@example.com');
    process.exit(1);
  }

  const [username, password, email] = args;

  try {
    console.log('🚀 Creating admin user...');
    
    const success = await adminAuthRepo.createAdminUser(username, password, email);
    
    if (success) {
      console.log('✅ Admin user created successfully!');
      console.log(`👤 Username: ${username}`);
      console.log(`📧 Email: ${email || 'Not provided'}`);
      console.log('🔐 Password: [hidden]');
    } else {
      console.log('❌ Failed to create admin user (may already exist)');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser(); 