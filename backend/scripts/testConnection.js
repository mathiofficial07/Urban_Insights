const mongoose = require('mongoose');
require('dotenv').config');

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log(`📡 Connection URI: ${process.env.MONGODB_URI}`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('✅ MongoDB connection successful!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Check users collection
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    const adminCount = await User.countDocuments({ userType: 'admin' });
    console.log(`🔐 Total admin users: ${adminCount}`);
    
    if (adminCount > 0) {
      const admins = await User.find({ userType: 'admin' }).select('email name userType isActive createdAt');
      console.log('\n📋 Admin Users:');
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.userType}`);
      });
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify the connection string in .env file');
    console.log('3. Check network connectivity');
    console.log('4. Verify MongoDB credentials and permissions');
  } finally {
    await mongoose.disconnect();
  }
};

testConnection();
