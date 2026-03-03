const axios = require('axios');

// Create test citizen user
const createTestCitizen = async () => {
  console.log('👤 Creating Test Citizen User...\n');

  try {
    const userData = {
      name: 'Test Citizen',
      email: 'citizen@test.com',
      password: 'password123',
      userType: 'citizen',
      phone: '1234567890',
      address: '123 Test Street, Test City'
    };

    console.log('📝 Registering new citizen...');
    const response = await axios.post('http://localhost:5000/api/auth/register', userData);

    if (response.data.success) {
      console.log('✅ Test citizen created successfully!');
      console.log('📋 User Details:');
      console.log(`   Name: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Type: ${userData.userType}`);
      console.log(`   Password: ${userData.password}`);
      console.log('\n🎉 You can now use these credentials to test complaint submission!');
    } else {
      console.log('ℹ️ User might already exist or there was an issue');
      console.log('Response:', response.data);
    }

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Test citizen already exists!');
      console.log('📋 Credentials:');
      console.log('   Email: citizen@test.com');
      console.log('   Password: password123');
    } else {
      console.error('❌ Error creating test citizen:', error.response?.data || error.message);
    }
  }
};

// Test login
const testLogin = async () => {
  console.log('\n🔐 Testing login...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'citizen@test.com',
      password: 'password123'
    });

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('🎫 Token received (first 50 chars):', response.data.token.substring(0, 50) + '...');
    } else {
      console.error('❌ Login failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
  }
};

// Main function
const runSetup = async () => {
  console.log('🚀 Setting up Test Citizen User\n');
  console.log('=' .repeat(50));
  
  await createTestCitizen();
  await testLogin();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Setup completed');
  console.log('\n📝 Ready to test complaint submission!');
};

// Run setup
runSetup().catch(console.error);
