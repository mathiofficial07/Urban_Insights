const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('Connected to MongoDB');

    // Check for admin users
    const adminUsers = await User.find({ userType: 'admin' });
    
    console.log(`\n=== Admin Users Found: ${adminUsers.length} ===`);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in database.');
      console.log('💡 Run the admin creation script first:');
      console.log('   node scripts/createAdmin.js');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Name: ${admin.name}`);
        console.log(`   🆔 ID: ${admin._id}`);
        console.log(`   ✅ Active: ${admin.isActive}`);
        console.log(`   📅 Created: ${admin.createdAt}`);
      });
      
      console.log('\n✅ Admin users exist. You should be able to login with these credentials.');
    }

  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkAdmin();
