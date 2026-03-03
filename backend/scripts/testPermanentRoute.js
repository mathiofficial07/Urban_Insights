const http = require('http');

console.log('🧪 TESTING PERMANENT ADMIN ROUTE\n');

const loginData = JSON.stringify({
  email: 'mathiyazhagan907@gmail.com',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/permanent-auth/permanent-admin-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  },
  timeout: 5000
};

console.log('📡 Testing permanent admin route...');
console.log('🔗 URL: http://localhost:5000/api/permanent-auth/permanent-admin-login');

const req = http.request(options, (res) => {
  console.log(`📊 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ PERMANENT ADMIN ROUTE IS WORKING!');
    } else if (res.statusCode === 404) {
      console.log('\n❌ ROUTE NOT FOUND (404)');
      console.log('🔧 SOLUTION: Restart the backend server');
      console.log('   1. Stop current server (Ctrl+C)');
      console.log('   2. Run: npm run dev');
      console.log('   3. Try login again');
    } else {
      console.log('\n❌ ROUTE ERROR:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ REQUEST FAILED:', error.message);
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('1. Make sure backend server is running: npm run dev');
  console.log('2. Check if server started without errors');
  console.log('3. Restart server if needed');
});

req.on('timeout', () => {
  console.log('❌ REQUEST TIMEOUT');
  req.destroy();
});

req.write(loginData);
req.end();
