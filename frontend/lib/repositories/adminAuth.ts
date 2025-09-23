import dbConnect from '../mongodb';
import AdminUser from '../models/AdminUser';

export class AdminAuthRepository {
  // Ensure database connection
  private async ensureConnection() {
    await dbConnect();
  }

  // Authenticate admin user
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const user = await AdminUser.findOne({ 
        username: username.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        return false;
      }

      const isValid = await user.comparePassword(password);
      
      if (isValid) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }

      return isValid;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  // Create admin user (for setup/seeding)
  async createAdminUser(username: string, password: string, email?: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      // Check if user already exists
      const existingUser = await AdminUser.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        console.log('Admin user already exists');
        return false;
      }

      const adminUser = new AdminUser({
        username: username.toLowerCase(),
        password,
        email,
        isActive: true,
      });

      await adminUser.save();
      console.log(`Admin user '${username}' created successfully`);
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  }

  // Get admin user info (without password)
  async getAdminUser(username: string) {
    try {
      await this.ensureConnection();
      
      const user = await AdminUser.findOne({ 
        username: username.toLowerCase(),
        isActive: true 
      }).select('-password');

      return user;
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  // Update admin password
  async updatePassword(username: string, newPassword: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const user = await AdminUser.findOne({ 
        username: username.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        return false;
      }

      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  // Check if any admin users exist
  async hasAdminUsers(): Promise<boolean> {
    try {
      await this.ensureConnection();
      const count = await AdminUser.countDocuments({ isActive: true });
      return count > 0;
    } catch (error) {
      console.error('Error checking admin users:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const adminAuthRepo = new AdminAuthRepository(); 