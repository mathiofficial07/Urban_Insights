const { spawn } = require('child_process');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function quickFix() {
  try {
    console.log('🚀 QUICK FIX FOR ADMIN LOGIN\n');
    
    // Step 1: Connect to database
    console.log('1. Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-insights');
    console.log('   ✅ Connected to MongoDB\n');
    
    // Step 2: Setup admin user
    console.log('2. Setting up admin user...');
    await User.deleteMany({ email: 'mathiyazhagan907@gmail.com' });
    
    const admin = new User({
      name: 'System Administrator',
      email: 'mathiyazhagan907@gmail.com',
      password: '123456',
      userType: 'admin',
      isActive: true
    });
    
    await admin.save();
    console.log('   ✅ Admin user created\n');
    
    // Step 3: Test credentials
    console.log('3. Testing credentials...');
    const testUser = await User.findOne({ email: 'mathiyazhagan907@gmail.com' }).select('+password');
    const isValid = await testUser.comparePassword('123456');
    console.log('   ✅ Password validation:', isValid ? 'PASSED' : 'FAILED');
    
    await mongoose.disconnect();
    
    if (!isValid) {
      console.log('❌ Password validation failed. Please check the implementation.');
      return;
    }
    
    // Step 4: Start server
    console.log('\n4. Starting backend server...');
    console.log('   📡 Server will start on http://localhost:5000');
    console.log('   🔑 Admin credentials: mathiyazhagan907@gmail.com / 123456');
    console.log('   🛑 Press Ctrl+C to stop the server\n');
    
    // Start the server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: __dirname.replace('\\scripts', '')
    });
    
    server.on('close', (code) => {
      console.log(`\n📡 Server process exited with code ${code}`);
    });
    
    // Wait a moment for server to start, then test
    setTimeout(() => {
      console.log('\n5. Testing server health...');
      const http = require('http');
      
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/health',
        method: 'GET'
      }, (res) => {
        console.log(`   ✅ Server health check: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('\n🎉 SUCCESS! Everything is ready!');
          console.log('\n📋 LOGIN TEST:');
          console.log('   URL: http://localhost:3000/login');
          console.log('   Email: mathiyazhagan907@gmail.com');
          console.log('   Password: 123456');
          console.log('   Select: Admin account type');
          console.log('\n🌐 Open browser and test login now!');
        }
      });
      
      req.on('error', () => {
        console.log('   ❌ Server health check failed');
      });
      
      req.end();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickFix();
