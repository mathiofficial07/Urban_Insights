const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function emergencyFix() {
  try {
    console.log('🚨 EMERGENCY ADMIN LOGIN FIX\n');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('✅ Connected to MongoDB\n');
    
    // Delete all existing users and start fresh
    console.log('🗑️  Clearing all existing users...');
    await User.deleteMany({});
    console.log('✅ All users cleared\n');
    
    // Create fresh admin user
    console.log('👤 Creating fresh admin user...');
    const admin = new User({
      name: 'System Administrator',
      email: 'mathiyazhagan907@gmail.com',
      password: '123456',
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
    
    await admin.save();
    console.log('✅ Admin user created\n');
    
    // Test the admin user
    console.log('🧪 Testing admin credentials...');
    const testAdmin = await User.findOne({ email: 'mathiyazhagan907@gmail.com' }).select('+password');
    
    if (!testAdmin) {
      console.log('❌ Admin user not found after creation');
      return;
    }
    
    console.log('📧 Email:', testAdmin.email);
    console.log('👤 Name:', testAdmin.name);
    console.log('🔐 Type:', testAdmin.userType);
    console.log('✅ Active:', testAdmin.isActive);
    
    // Test password
    const isPasswordValid = await testAdmin.comparePassword('123456');
    console.log('🔑 Password "123456" valid:', isPasswordValid ? 'YES ✅' : 'NO ❌');
    
    if (!isPasswordValid) {
      console.log('🔧 Manually setting password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      await User.updateOne(
        { email: 'mathiyazhagan907@gmail.com' },
        { password: hashedPassword }
      );
      console.log('✅ Password manually set');
      
      // Test again
      const retest = await User.findOne({ email: 'mathiyazhagan907@gmail.com' }).select('+password');
      const retestValid = await retest.comparePassword('123456');
      console.log('🔑 Password valid after manual set:', retestValid ? 'YES ✅' : 'NO ❌');
    }
    
    // Create a test citizen user
    console.log('\n👥 Creating test citizen user...');
    const citizen = new User({
      name: 'Test Citizen',
      email: 'citizen@test.com',
      password: 'password123',
      userType: 'citizen',
      isActive: true
    });
    
    await citizen.save();
    console.log('✅ Test citizen created: citizen@test.com / password123');
    
    // Show all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({});
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType}`);
    });
    
    await mongoose.disconnect();
    
    console.log('\n🎉 EMERGENCY FIX COMPLETED!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('🔐 ADMIN: mathiyazhagan907@gmail.com / 123456');
    console.log('👤 CITIZEN: citizen@test.com / password123');
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd ../frontend && npm start');
    console.log('3. Go to: http://localhost:3000/login');
    console.log('4. Select "Admin" and use admin credentials');
    console.log('5. Should redirect to /admin dashboard');
    
  } catch (error) {
    console.error('❌ EMERGENCY FIX ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

emergencyFix();
