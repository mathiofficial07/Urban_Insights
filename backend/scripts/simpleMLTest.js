const http = require('http');

console.log('🧠 SIMPLE ML MODEL TEST\n');

// Test ML Service
function testMLService() {
  return new Promise((resolve) => {
    console.log('1. Testing ML Service on http://localhost:5001...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ ML Service is RUNNING');
          console.log('📊 Response:', data);
          resolve(true);
        } else {
          console.log('❌ ML Service returned status:', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ ML Service is NOT RUNNING');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ ML Service TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test Backend
function testBackend() {
  return new Promise((resolve) => {
    console.log('\n2. Testing Backend on http://localhost:5000...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend is RUNNING');
          console.log('📊 Response:', data);
          resolve(true);
        } else {
          console.log('❌ Backend returned status:', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Backend is NOT RUNNING');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Backend TIMEOUT');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main test function
async function runTest() {
  const mlRunning = await testMLService();
  const backendRunning = await testBackend();
  
  console.log('\n📋 RESULTS:');
  console.log('=============');
  console.log('ML Service:', mlRunning ? '✅ RUNNING' : '❌ STOPPED');
  console.log('Backend:', backendRunning ? '✅ RUNNING' : '❌ STOPPED');
  
  console.log('\n🔧 NEXT STEPS:');
  
  if (!mlRunning) {
    console.log('1. Start ML Service:');
    console.log('   cd ml-service');
    console.log('   pip install -r requirements.txt');
    console.log('   python app.py');
  }
  
  if (!backendRunning) {
    console.log('2. Start Backend:');
    console.log('   cd backend');
    console.log('   npm run dev');
  }
  
  if (mlRunning && backendRunning) {
    console.log('🎉 Both services are running!');
    console.log('💡 ML models should be working');
  }
  
  console.log('\n📚 For detailed ML testing, run:');
  console.log('   cd backend');
  console.log('   npm run test-ml');
}

runTest();
