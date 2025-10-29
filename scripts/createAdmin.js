const User = require('./src/models/User');
const connectDB = require('./src/config/database');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword123',
      role: 'admin',
      isFirstLogin: false,
      mustChangePassword: false
    });
    
    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: AdminPassword123`);
    console.log(`Role: ${admin.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();