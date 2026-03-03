const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('Connected to MongoDB');

    // Test admin credentials
    const adminEmail = 'mathiyazhagan907@gmail.com';
    const adminPassword = '123456';

    console.log(`\n=== Testing Login for: ${adminEmail} ===`);

    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found in database.');
      console.log('💡 Run the admin creation script first:');
      console.log('   node scripts/createAdmin.js');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   👤 Name: ${admin.name}`);
    console.log(`   🔐 User Type: ${admin.userType}`);
    console.log(`   ✅ Active: ${admin.isActive}`);

    // Test password comparison
    const isPasswordValid = await admin.comparePassword(adminPassword);
    
    if (isPasswordValid) {
      console.log('✅ Password validation successful!');
      console.log('🎉 Login should work with these credentials.');
    } else {
      console.log('❌ Password validation failed!');
      console.log('💡 The password might be incorrect or corrupted.');
      console.log('🔄 Try recreating the admin user:');
      console.log('   node scripts/createAdmin.js');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

testLogin();
