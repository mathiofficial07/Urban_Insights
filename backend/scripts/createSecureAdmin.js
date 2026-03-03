const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createSecureAdmin = async () => {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    if (!adminEmail || !adminPassword) {
      console.log('❌ Admin credentials not found in environment variables.');
      console.log('📝 Please set the following environment variables:');
      console.log('   - ADMIN_EMAIL');
      console.log('   - ADMIN_PASSWORD');
      console.log('   - ADMIN_NAME (optional)');
      console.log('');
      console.log('💡 Example: Add these to your .env file:');
      console.log('   ADMIN_EMAIL=admin@example.com');
      console.log('   ADMIN_PASSWORD=your_secure_password');
      console.log('   ADMIN_NAME=Admin User');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists with email:', adminEmail);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      userType: 'admin',
      phone: '+1234567890',
      address: {
        street: 'Admin Office',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: [REDACTED FOR SECURITY]');
    console.log('👤 Name:', adminName);
    console.log('🔐 User Type: admin');
    console.log('');
    console.log('🎉 Admin account is ready for use!');
    console.log('⚠️  Remember to keep these credentials secure and change the password regularly.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createSecureAdmin();
