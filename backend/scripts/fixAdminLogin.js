const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const fixAdminLogin = async () => {
  try {
    console.log('🔧 Starting Admin Login Fix...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('✅ MongoDB connected successfully!\n');

    // Check existing admin
    const adminEmail = 'mathiyazhagan907@gmail.com';
    const adminPassword = '123456';
    
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin user found:', existingAdmin.email);
      console.log('🗑️  Removing existing admin user...');
      await User.deleteOne({ email: adminEmail });
      console.log('✅ Existing admin user removed\n');
    } else {
      console.log('ℹ️  No existing admin user found\n');
    }

    // Create new admin user
    console.log('👤 Creating new admin user...');
    const adminUser = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      userType: 'admin',
      phone: '+1234567890',
      address: {
        street: 'Admin Office',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345'
      },
      isActive: true
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully!\n');

    // Test the admin user
    console.log('🧪 Testing admin user login...');
    const testAdmin = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!testAdmin) {
      throw new Error('Admin user not found after creation');
    }

    console.log('📧 Email:', testAdmin.email);
    console.log('👤 Name:', testAdmin.name);
    console.log('🔐 User Type:', testAdmin.userType);
    console.log('✅ Active:', testAdmin.isActive);

    // Test password comparison
    const isPasswordValid = await testAdmin.comparePassword(adminPassword);
    console.log('🔑 Password Valid:', isPasswordValid ? '✅ YES' : '❌ NO');

    if (isPasswordValid) {
      console.log('\n🎉 SUCCESS! Admin login should work now!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: mathiyazhagan907@gmail.com');
      console.log('   Password: 123456');
      console.log('   User Type: admin');
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Start the backend server: npm run dev');
      console.log('2. Start the frontend: npm start');
      console.log('3. Try logging in with the credentials above');
      
    } else {
      console.log('\n❌ Password validation failed!');
      console.log('🔄 Retrying admin creation...');
      
      // Try one more time with explicit password hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await User.updateOne(
        { email: adminEmail },
        { password: hashedPassword }
      );
      
      console.log('✅ Password updated manually');
      console.log('🧪 Testing again...');
      
      const retestAdmin = await User.findOne({ email: adminEmail }).select('+password');
      const retestValid = await retestAdmin.comparePassword(adminPassword);
      console.log('🔑 Password Valid:', retestValid ? '✅ YES' : '❌ NO');
      
      if (retestValid) {
        console.log('\n🎉 SUCCESS after manual password update!');
      } else {
        console.log('\n❌ Still having issues. Please check the implementation.');
      }
    }

  } catch (error) {
    console.error('❌ Error during fix:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

fixAdminLogin();
