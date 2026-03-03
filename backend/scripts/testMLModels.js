const http = require('http');
const axios = require('axios');

console.log('🧠 TESTING ML MODELS\n');

// Test 1: Check if ML service is running
async function testMLService() {
  try {
    console.log('1. Testing ML Service Connection...');
    
    const response = await axios.get('http://localhost:5001/health', {
      timeout: 5000
    });
    
    console.log('✅ ML Service is running');
    console.log('📊 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ ML Service is not running');
    console.log('🔧 To start ML service:');
    console.log('   cd ml-service');
    console.log('   python app.py');
    return false;
  }
}

// Test 2: Test ML prediction endpoint
async function testMLPrediction() {
  try {
    console.log('\n2. Testing ML Prediction...');
    
    const testData = {
      text: "There is a broken water pipe on the main street",
      category: "water",
      location: {
        latitude: 13.0827,
        longitude: 80.2707
      }
    };
    
    const response = await axios.post('http://localhost:5001/predict', testData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ ML Prediction is working');
    console.log('📊 Predictions:', response.data);
    return true;
  } catch (error) {
    console.log('❌ ML Prediction failed');
    console.log('📝 Error:', error.message);
    return false;
  }
}

// Test 3: Test ML clustering endpoint
async function testMLClustering() {
  try {
    console.log('\n3. Testing ML Clustering...');
    
    const testData = {
      complaints: [
        {
          text: "Broken water pipe on main street",
          category: "water",
          location: { latitude: 13.0827, longitude: 80.2707 }
        },
        {
          text: "Street light not working",
          category: "electricity",
          location: { latitude: 13.0837, longitude: 80.2717 }
        }
      ]
    };
    
    const response = await axios.post('http://localhost:5001/cluster', testData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ ML Clustering is working');
    console.log('📊 Clusters:', response.data);
    return true;
  } catch (error) {
    console.log('❌ ML Clustering failed');
    console.log('📝 Error:', error.message);
    return false;
  }
}

// Test 4: Test backend ML routes
async function testBackendMLRoutes() {
  try {
    console.log('\n4. Testing Backend ML Routes...');
    
    // Test backend health first
    const healthResponse = await axios.get('http://localhost:5000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Backend is running');
    
    // Test backend ML prediction route (will fail if ML service is down)
    try {
      const testData = {
        text: "Broken water pipe on main street",
        category: "water",
        location: {
          latitude: 13.0827,
          longitude: 80.2707
        }
      };
      
      const mlResponse = await axios.post('http://localhost:5000/api/ml/predict', testData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-test'
        }
      });
      
      console.log('✅ Backend ML route is working');
      console.log('📊 Response:', mlResponse.data);
      return true;
    } catch (mlError) {
      console.log('❌ Backend ML route failed');
      console.log('📝 Error:', mlError.message);
      if (mlError.response && mlError.response.status === 503) {
        console.log('💡 This usually means ML service is not running');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not running');
    console.log('🔧 To start backend: cd backend && npm run dev');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ML Model Tests...\n');
  
  const results = {
    mlService: await testMLService(),
    mlPrediction: await testMLPrediction(),
    mlClustering: await testMLClustering(),
    backendML: await testBackendMLRoutes()
  };
  
  console.log('\n📋 TEST SUMMARY:');
  console.log('================');
  console.log('ML Service Running:', results.mlService ? '✅ YES' : '❌ NO');
  console.log('ML Prediction:', results.mlPrediction ? '✅ WORKING' : '❌ FAILED');
  console.log('ML Clustering:', results.mlClustering ? '✅ WORKING' : '❌ FAILED');
  console.log('Backend ML Routes:', results.backendML ? '✅ WORKING' : '❌ FAILED');
  
  console.log('\n🔧 SETUP INSTRUCTIONS:');
  if (!results.mlService) {
    console.log('1. Start ML Service:');
    console.log('   cd ml-service');
    console.log('   pip install -r requirements.txt');
    console.log('   python app.py');
  }
  
  if (!results.backendML) {
    console.log('2. Start Backend:');
    console.log('   cd backend');
    console.log('   npm run dev');
  }
  
  if (results.mlService && results.mlPrediction && results.mlClustering) {
    console.log('\n🎉 ML MODELS ARE WORKING PERFECTLY!');
  } else {
    console.log('\n⚠️  SOME ML COMPONENTS NEED ATTENTION');
  }
}

runAllTests().catch(console.error);
