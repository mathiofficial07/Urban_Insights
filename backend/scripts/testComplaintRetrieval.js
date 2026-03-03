const axios = require('axios');

// Test complaint retrieval for a user
const testComplaintRetrieval = async () => {
  console.log('🧪 Testing Complaint Retrieval...\n');

  try {
    // First, login as a citizen to get token
    console.log('📝 Logging in as test citizen...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'citizen@test.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test getting user's complaints
    console.log('\n📋 Testing complaint retrieval...');
    const getResponse = await axios.get('http://localhost:5000/api/complaints/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.data.success) {
      console.log('✅ Complaints retrieved successfully!');
      console.log(`📊 Found ${getResponse.data.complaints.length} complaints:`);
      
      if (getResponse.data.complaints.length > 0) {
        getResponse.data.complaints.forEach((complaint, index) => {
          console.log(`\n   ${index + 1}. ${complaint.complaintId}`);
          console.log(`      Title: ${complaint.title}`);
          console.log(`      Status: ${complaint.status}`);
          console.log(`      Category: ${complaint.category}`);
          console.log(`      Created: ${new Date(complaint.createdAt).toLocaleString()}`);
          console.log(`      Location: ${complaint.location?.address || 'N/A'}`);
        });
      } else {
        console.log('ℹ️ No complaints found for this user');
      }
    } else {
      console.error('❌ Failed to retrieve complaints:', getResponse.data);
    }

    // Test getting all complaints (admin endpoint - should fail for citizen)
    console.log('\n🔒 Testing admin endpoint (should fail for citizen)...');
    try {
      const adminResponse = await axios.get('http://localhost:5000/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('⚠️ Warning: Admin endpoint accessible to citizen (this should not happen)');
    } catch (adminError) {
      if (adminError.response?.status === 403) {
        console.log('✅ Admin endpoint properly protected');
      } else {
        console.log('ℹ️ Admin endpoint error:', adminError.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Authentication failed - check login credentials');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Tip: API endpoint not found - check server routes');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the backend server is running on port 5000');
    }
  }
};

// Test MongoDB connection and data
const testMongoDBData = async () => {
  console.log('\n🔍 Testing MongoDB Data...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    if (response.data.status === 'OK') {
      console.log('✅ Backend server is running');
    }
  } catch (error) {
    console.error('❌ Backend server connection failed:', error.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Complaint Retrieval Tests\n');
  console.log('=' .repeat(50));
  
  await testMongoDBData();
  await testComplaintRetrieval();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed');
  console.log('\n📝 If complaints are retrieved here but not showing in frontend:');
  console.log('   1. Check browser console for API errors');
  console.log('   2. Verify JWT token is stored in localStorage');
  console.log('   3. Check network tab in browser dev tools');
  console.log('   4. Ensure frontend is calling the correct endpoint');
};

// Run tests
runTests().catch(console.error);
