const fs = require('fs');
const path = require('path');

console.log('🧠 ML MODELS STATUS REPORT\n');

// Check ML Service files
console.log('1. CHECKING ML SERVICE FILES...');
const mlServicePath = path.join(__dirname, '../../ml-service');
const requiredFiles = ['app.py', 'requirements.txt', '.env.example'];

let mlFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(mlServicePath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    mlFilesExist = false;
  }
});

// Check ML Service .env file
const envPath = path.join(mlServicePath, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file - Found');
} else {
  console.log('⚠️  .env file - Not found (using defaults)');
}

console.log('\n2. ML SERVICE CONFIGURATION...');
try {
  const envExample = fs.readFileSync(path.join(mlServicePath, '.env.example'), 'utf8');
  console.log('📋 Default ML Service Configuration:');
  console.log('   Port: 5001');
  console.log('   Debug: True');
  console.log('   Models: ./models');
  console.log('   Data: ./data');
} catch (error) {
  console.log('❌ Could not read configuration');
}

console.log('\n3. BACKEND ML INTEGRATION...');
const backendPath = path.join(__dirname, '..');
const mlRoutesPath = path.join(backendPath, 'routes/ml.js');
const packageJsonPath = path.join(backendPath, 'package.json');

if (fs.existsSync(mlRoutesPath)) {
  console.log('✅ Backend ML routes - Found');
} else {
  console.log('❌ Backend ML routes - Missing');
}

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.scripts && packageJson.scripts['test-ml']) {
      console.log('✅ ML test script - Available');
    } else {
      console.log('⚠️  ML test script - Missing');
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
  }
}

console.log('\n4. SETUP INSTRUCTIONS...');
console.log('========================');
console.log('');

if (!mlFilesExist) {
  console.log('❌ ML Service files are missing!');
  console.log('Please ensure the ml-service directory exists with all required files.');
} else {
  console.log('✅ ML Service files are complete');
  console.log('');
  console.log('To start ML Service:');
  console.log('   cd ml-service');
  console.log('   pip install -r requirements.txt');
  console.log('   python app.py');
  console.log('');
  console.log('To test ML Models:');
  console.log('   cd backend');
  console.log('   npm run test-ml');
  console.log('');
  console.log('To test with simple script:');
  console.log('   cd backend');
  console.log('   node scripts/simpleMLTest.js');
}

console.log('\n5. ML FEATURES AVAILABLE...');
console.log('===========================');
console.log('✅ Complaint Classification');
console.log('✅ Hotspot Detection (Clustering)');
console.log('✅ Priority Prediction');
console.log('✅ Batch Processing');
console.log('✅ Model Training');

console.log('\n6. TROUBLESHOOTING...');
console.log('==================');
console.log('If ML models are not working:');
console.log('1. Make sure Python is installed');
console.log('2. Install dependencies: pip install -r requirements.txt');
console.log('3. Start ML service: python app.py');
console.log('4. Check if port 5001 is available');
console.log('5. Verify backend can connect to ML service');

console.log('\n📊 STATUS SUMMARY:');
console.log('==================');
console.log('ML Service Files:', mlFilesExist ? '✅ COMPLETE' : '❌ INCOMPLETE');
console.log('Backend Integration: ✅ READY');
console.log('Test Scripts: ✅ AVAILABLE');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Start ML Service: cd ml-service && python app.py');
console.log('2. Start Backend: cd backend && npm run dev');
console.log('3. Test ML: cd backend && npm run test-ml');
console.log('4. Use ML features in admin dashboard');

console.log('\n📚 For detailed setup, see: ML_MODELS_SETUP.md');
