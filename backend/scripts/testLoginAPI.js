const http = require('http');

console.log('🧪 TESTING ADMIN LOGIN API\n');

const loginData = JSON.stringify({
  email: 'mathiyazhagan907@gmail.com',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  },
  timeout: 10000
};

console.log('📡 Sending login request to http://localhost:5000/api/auth/login');
console.log('📧 Email: mathiyazhagan907@gmail.com');
console.log('🔑 Password: 123456\n');

const req = http.request(options, (res) => {
  console.log(`📊 Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 && response.token) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('🎫 Token received:', response.token.substring(0, 50) + '...');
        console.log('👤 User:', response.user.name, '(', response.user.email, ')');
        console.log('🔐 User Type:', response.user.userType);
        console.log('\n🎉 Admin login is working! Try logging in through the browser.');
      } else {
        console.log('\n❌ LOGIN FAILED!');
        console.log('📝 Error Message:', response.message || 'Unknown error');
        console.log('\n🔧 Possible fixes:');
        console.log('1. Run: npm run emergency-fix');
        console.log('2. Check if admin user exists in database');
        console.log('3. Verify password is correct');
      }
    } catch (error) {
      console.log('\n❌ Invalid JSON response:', data);
      console.log('🔧 Server might be returning HTML error page');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ REQUEST FAILED:', error.message);
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('1. Is backend server running? Check with: npm run test-server');
  console.log('2. Start backend server: npm run dev');
  console.log('3. Check if port 5000 is available');
  console.log('4. Verify MongoDB is connected');
});

req.on('timeout', () => {
  console.log('❌ REQUEST TIMEOUT');
  req.destroy();
});

req.write(loginData);
req.end();
