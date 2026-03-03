const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

console.log('Starting simple test...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights')
  .then(async () => {
    console.log('Connected to DB');
    
    // Delete existing admin
    await User.deleteMany({ email: 'mathiyazhagan907@gmail.com' });
    console.log('Deleted existing admin');
    
    // Create new admin
    const admin = new User({
      name: 'Admin',
      email: 'mathiyazhagan907@gmail.com',
      password: '123456',
      userType: 'admin'
    });
    
    await admin.save();
    console.log('Created new admin');
    
    // Test login
    const found = await User.findOne({ email: 'mathiyazhagan907@gmail.com' }).select('+password');
    const valid = await found.comparePassword('123456');
    console.log('Password valid:', valid);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
