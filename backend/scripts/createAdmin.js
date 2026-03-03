const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('Connected to MongoDB');

    // Remove ALL existing admin users to ensure only one admin
    console.log('Removing any existing admin users...');
    await User.deleteMany({ userType: 'admin' });
    console.log('✅ Cleared all existing admin users');

    // Create the single admin user
    const adminUser = new User({
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
      }
    });

    await adminUser.save();
    console.log('✅ Single admin user created successfully!');
    console.log('📧 Email: mathiyazhagan907@gmail.com');
    console.log('🔑 Password: [HIDDEN FOR SECURITY]');
    console.log('👤 User Type: admin');
    console.log('');
    console.log('⚠️  IMPORTANT: This is the ONLY admin account!');
    console.log('🔐 For security, consider updating this script to use environment variables for credentials.');
    console.log('📝 Registration form now creates CITIZEN accounts only.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();
