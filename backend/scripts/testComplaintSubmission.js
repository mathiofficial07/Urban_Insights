const axios = require('axios');

// Test complaint submission
const testComplaintSubmission = async () => {
  console.log('🧪 Testing Complaint Submission...\n');

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

    // Test complaint submission
    console.log('\n📤 Testing complaint submission...');
    
    const complaintData = {
      title: 'Test Complaint - Broken Street Light',
      description: 'There is a broken street light at the main intersection that has been out for over a week. This is causing safety concerns for pedestrians and drivers at night.',
      category: 'Infrastructure',
      priority: 'high',
      location: {
        address: '123 Main Street, Downtown',
        latitude: '13.0827',
        longitude: '80.2707'
      }
    };

    const submitResponse = await axios.post('http://localhost:5000/api/complaints', complaintData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (submitResponse.data.success || submitResponse.status === 201) {
      console.log('✅ Complaint submitted successfully!');
      console.log('📋 Complaint Details:');
      console.log(`   ID: ${submitResponse.data.complaint.complaintId}`);
      console.log(`   Title: ${submitResponse.data.complaint.title}`);
      console.log(`   Status: ${submitResponse.data.complaint.status}`);
      console.log(`   Category: ${submitResponse.data.complaint.category}`);
    } else {
      console.error('❌ Complaint submission failed:', submitResponse.data);
    }

    // Test retrieving the complaint
    console.log('\n📋 Testing complaint retrieval...');
    const getResponse = await axios.get('http://localhost:5000/api/complaints/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.data.success) {
      console.log(`✅ Found ${getResponse.data.complaints.length} complaints for user`);
      if (getResponse.data.complaints.length > 0) {
        const latestComplaint = getResponse.data.complaints[0];
        console.log(`   Latest: ${latestComplaint.title} (${latestComplaint.status})`);
      }
    } else {
      console.error('❌ Failed to retrieve complaints');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have a valid citizen account');
      console.log('   Email: citizen@test.com');
      console.log('   Password: password123');
    } else if (error.response?.status === 400) {
      console.log('\n💡 Tip: Check the complaint data format');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the backend server is running on port 5000');
    }
  }
};

// Test MongoDB connection
const testMongoDBConnection = async () => {
  console.log('\n🔍 Testing MongoDB Connection...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    if (response.data.status === 'OK') {
      console.log('✅ Backend server is running');
      console.log('✅ MongoDB connection appears to be working');
    }
  } catch (error) {
    console.error('❌ Backend server connection failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend');
    console.log('   npm start');
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Complaint Submission Tests\n');
  console.log('=' .repeat(50));
  
  await testMongoDBConnection();
  await testComplaintSubmission();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests completed');
};

// Run tests
runTests().catch(console.error);
