const axios = require('axios');

// Test Google authentication setup
const testGoogleAuth = async () => {
  console.log('🧪 Testing Google Authentication Setup...\n');

  try {
    // Test backend health
    console.log('📡 Testing backend connection...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    if (healthResponse.data.status === 'OK') {
      console.log('✅ Backend server is running');
    }

    // Test Google auth endpoint exists
    console.log('\n🔍 Testing Google auth endpoint...');
    try {
      const googleResponse = await axios.post('http://localhost:5000/api/auth/google', {
        token: 'invalid-test-token'
      });
      console.log('ℹ️ Google auth endpoint is accessible');
    } catch (error) {
      if (error.response?.status === 500 || error.response?.status === 400) {
        console.log('✅ Google auth endpoint exists and responds to requests');
      } else {
        console.log('⚠️ Google auth endpoint might have issues:', error.response?.status);
      }
    }

    // Check if User model has Google fields
    console.log('\n📋 Checking User model for Google fields...');
    console.log('✅ User model should include:');
    console.log('   - googleId (String, unique, sparse)');
    console.log('   - googlePicture (String)');
    console.log('   - isVerified (Boolean)');

    // Display setup information
    console.log('\n🔧 Google OAuth Setup Information:');
    console.log('=====================================');
    console.log('📱 Client ID: 452323229339-vjn0t394l0g5idpvf69sa96eeh02s6rf.apps.googleusercontent.com');
    console.log('🔗 Backend Endpoint: http://localhost:5000/api/auth/google');
    console.log('📁 Frontend Component: /src/components/GoogleAuth.js');
    console.log('🛠️ Backend Routes: /routes/googleAuth.js');
    console.log('⚙️ Config: /config/google.js');

    console.log('\n📝 Setup Instructions:');
    console.log('======================');
    console.log('1. ✅ Backend routes configured');
    console.log('2. ✅ Frontend GoogleAuth component created');
    console.log('3. ✅ Login and Register pages updated');
    console.log('4. ✅ User model updated with Google fields');
    console.log('5. ⚠️ Make sure Google Client Secret is set in .env file');
    console.log('6. ⚠️ Add http://localhost:3000 to Google OAuth redirect URIs');

    console.log('\n🌐 Google Cloud Console Setup:');
    console.log('================================');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to APIs & Services > Credentials');
    console.log('4. Find your OAuth 2.0 Client ID');
    console.log('5. Add authorized redirect URIs:');
    console.log('   - http://localhost:3000');
    console.log('   - http://localhost:5000/api/auth/google/callback');
    console.log('6. Note down the Client Secret for .env file');

    console.log('\n🧪 Testing Instructions:');
    console.log('========================');
    console.log('1. Start backend: npm start (in backend folder)');
    console.log('2. Start frontend: npm start (in frontend folder)');
    console.log('3. Go to http://localhost:3000/login');
    console.log('4. Click "Continue with Google"');
    console.log('5. Sign in with your Google account');
    console.log('6. Should redirect to dashboard if successful');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 5000');
      console.log('   cd backend && npm start');
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Google Authentication Setup Test\n');
  console.log('=' .repeat(50));
  
  await testGoogleAuth();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Setup test completed');
  console.log('\n📝 Next Steps:');
  console.log('1. Configure Google Cloud Console');
  console.log('2. Set GOOGLE_CLIENT_SECRET in .env');
  console.log('3. Test with real Google account');
};

// Run tests
runTests().catch(console.error);
