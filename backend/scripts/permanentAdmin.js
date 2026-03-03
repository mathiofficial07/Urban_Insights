const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const PERMANENT_ADMIN = {
  email: 'mathiyazhagan907@gmail.com',
  password: '123456',
  name: 'System Administrator',
  userType: 'admin',
  phone: '+1234567890',
  address: {
    street: 'Admin Office',
    city: 'Admin City',
    state: 'Admin State',
    zipCode: '12345'
  }
};

const ensurePermanentAdmin = async () => {
  try {
    console.log('🔐 ENSURING PERMANENT ADMIN ACCOUNT\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('✅ Connected to MongoDB');

    // Check if permanent admin exists
    let admin = await User.findOne({ email: PERMANENT_ADMIN.email });
    
    if (!admin) {
      console.log('📧 Creating permanent admin account...');
      admin = new User(PERMANENT_ADMIN);
      await admin.save();
      console.log('✅ Permanent admin created');
    } else {
      console.log('📧 Permanent admin found, ensuring credentials...');
      
      // Update admin to ensure correct credentials
      admin.name = PERMANENT_ADMIN.name;
      admin.userType = PERMANENT_ADMIN.userType;
      admin.phone = PERMANENT_ADMIN.phone;
      admin.address = PERMANENT_ADMIN.address;
      admin.isActive = true;
      
      // Reset password to ensure it's always 123456
      admin.password = PERMANENT_ADMIN.password;
      await admin.save();
      console.log('✅ Permanent admin credentials updated');
    }

    // Test the admin credentials
    console.log('\n🧪 Testing permanent admin credentials...');
    const testAdmin = await User.findOne({ email: PERMANENT_ADMIN.email }).select('+password');
    
    if (!testAdmin) {
      throw new Error('Admin user not found after creation');
    }

    const isPasswordValid = await testAdmin.comparePassword(PERMANENT_ADMIN.password);
    console.log('🔑 Password validation:', isPasswordValid ? 'PASSED ✅' : 'FAILED ❌');

    if (!isPasswordValid) {
      throw new Error('Password validation failed');
    }

    // Remove any other admin users to ensure only this one exists
    const otherAdmins = await User.deleteMany({ 
      userType: 'admin', 
      email: { $ne: PERMANENT_ADMIN.email } 
    });
    
    if (otherAdmins.deletedCount > 0) {
      console.log(`🗑️  Removed ${otherAdmins.deletedCount} other admin users`);
    }

    console.log('\n🎉 PERMANENT ADMIN ACCOUNT ENSURED!');
    console.log('📧 Email:', PERMANENT_ADMIN.email);
    console.log('🔑 Password:', PERMANENT_ADMIN.password);
    console.log('👤 Name:', PERMANENT_ADMIN.name);
    console.log('🔐 Type:', PERMANENT_ADMIN.userType);
    console.log('✅ This admin account will always be available');
    
    return admin;

  } catch (error) {
    console.error('❌ Error ensuring permanent admin:', error.message);
    throw error;
  }
};

// Auto-run if called directly
if (require.main === module) {
  ensurePermanentAdmin()
    .then(() => {
      console.log('\n✅ Permanent admin setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Permanent admin setup failed:', error);
      process.exit(1);
    });
}

module.exports = { ensurePermanentAdmin, PERMANENT_ADMIN };
