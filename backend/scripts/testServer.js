const http = require('http');

console.log('🔍 TESTING BACKEND SERVER...\n');

// Test if server is running on port 5000
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server responded with status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📊 Server response:', response);
      console.log('\n🎉 Backend server is running and accessible!');
      console.log('🌐 Server URL: http://localhost:5000');
      console.log('🔑 Login Endpoint: http://localhost:5000/api/auth/login');
    } catch (error) {
      console.log('❌ Invalid JSON response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Server connection failed:', error.message);
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('1. Make sure backend server is running: npm run dev');
  console.log('2. Check if port 5000 is available');
  console.log('3. Verify no firewall is blocking the connection');
  console.log('4. Check if MongoDB is connected');
});

req.on('timeout', () => {
  console.log('❌ Server request timed out');
  req.destroy();
});

req.end();
