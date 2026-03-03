const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const debugAdminLogin = async () => {
  try {
    console.log('🔍 DEBUGGING ADMIN LOGIN ISSUE\n');
    
    // Step 1: Check Environment Variables
    console.log('1. ENVIRONMENT VARIABLES:');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');
    console.log('   PORT:', process.env.PORT || '5000');
    console.log('');

    // Step 2: Test Database Connection
    console.log('2. DATABASE CONNECTION:');
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
      console.log('   ✅ Connected to MongoDB');
    } catch (error) {
      console.log('   ❌ MongoDB Connection Failed:', error.message);
      return;
    }

    // Step 3: Check Admin User
    console.log('\n3. ADMIN USER CHECK:');
    const adminEmail = 'mathiyazhagan907@gmail.com';
    const adminPassword = '123456';
    
    try {
      const admin = await User.findOne({ email: adminEmail });
      
      if (!admin) {
        console.log('   ❌ Admin user not found');
        console.log('   💡 Creating admin user...');
        
        // Create admin user
        const newAdmin = new User({
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
        
        await newAdmin.save();
        console.log('   ✅ Admin user created');
      } else {
        console.log('   ✅ Admin user found');
        console.log('   📧 Email:', admin.email);
        console.log('   👤 Name:', admin.name);
        console.log('   🔐 Type:', admin.userType);
        console.log('   ✅ Active:', admin.isActive);
        console.log('   📅 Created:', admin.createdAt);
      }
    } catch (error) {
      console.log('   ❌ Error checking admin user:', error.message);
    }

    // Step 4: Test Password
    console.log('\n4. PASSWORD VALIDATION:');
    try {
      const adminWithPassword = await User.findOne({ email: adminEmail }).select('+password');
      
      if (!adminWithPassword) {
        console.log('   ❌ Admin user not found for password test');
        return;
      }
      
      console.log('   🔑 Testing password:', adminPassword);
      const isPasswordValid = await adminWithPassword.comparePassword(adminPassword);
      console.log('   ✅ Password valid:', isPasswordValid ? 'YES' : 'NO');
      
      if (!isPasswordValid) {
        console.log('   🔧 Resetting password...');
        adminWithPassword.password = adminPassword;
        await adminWithPassword.save();
        console.log('   ✅ Password reset successfully');
        
        // Test again
        const retest = await User.findOne({ email: adminEmail }).select('+password');
        const retestValid = await retest.comparePassword(adminPassword);
        console.log('   ✅ Password valid after reset:', retestValid ? 'YES' : 'NO');
      }
    } catch (error) {
      console.log('   ❌ Error testing password:', error.message);
    }

    // Step 5: Test JWT Token Generation
    console.log('\n5. JWT TOKEN TEST:');
    try {
      const jwt = require('jsonwebtoken');
      const admin = await User.findOne({ email: adminEmail });
      
      if (!admin) {
        console.log('   ❌ Admin user not found for JWT test');
        return;
      }
      
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      console.log('   ✅ JWT Token generated successfully');
      console.log('   🎫 Token (first 50 chars):', token.substring(0, 50) + '...');
    } catch (error) {
      console.log('   ❌ JWT Token generation failed:', error.message);
    }

    // Step 6: Summary
    console.log('\n6. DEBUG SUMMARY:');
    console.log('   📊 Admin User:', adminEmail);
    console.log('   🔑 Password:', adminPassword);
    console.log('   🌐 Server URL: http://localhost:5000');
    console.log('   🔑 Login Endpoint: POST /api/auth/login');
    console.log('');
    console.log('   🧪 Test with curl:');
    console.log('   curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"' + adminEmail + '","password":"' + adminPassword + '"}\'');
    console.log('');
    console.log('   🚀 Next Steps:');
    console.log('   1. Start backend server: npm run dev');
    console.log('   2. Test login with above curl command');
    console.log('   3. Check browser console for errors');
    console.log('   4. Check backend console for detailed error messages');

  } catch (error) {
    console.error('❌ DEBUG SCRIPT ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from database');
  }
};

debugAdminLogin();
