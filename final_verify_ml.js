const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function verifyAPI() {
    console.log('--- ML API VERIFICATION ---');
    try {
        // 1. Check Backend Health
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('Backend Health:', health.data.status);

        // 2. Check ML Prediction Overview (Requires Auth, but let's check the error)
        try {
            await axios.get('http://localhost:5000/api/ml/prediction/overview');
        } catch (e) {
            console.log('Overview (No Auth):', e.response?.status, e.response?.data?.message);
        }

        // 3. Check ML Service directly
        try {
            const mlHealth = await axios.get('http://localhost:5001/health');
            console.log('ML Service Health:', mlHealth.data.status);
        } catch (e) {
            console.log('ML Service Error:', e.message);
        }

        // 4. Try Clustering (The user mentioned predictions)
        try {
            const predict = await axios.post('http://localhost:5001/predict', {
                text: "Test complaint about broken road",
                category: "Roads",
                location: { latitude: 11.0, longitude: 77.0 }
            });
            console.log('ML Prediction directly:', predict.data.category?.predicted || 'FAILED');
        } catch (e) {
            console.log('ML Predict Error:', e.message);
        }

    } catch (error) {
        console.log('Global Error:', error.message);
    }
}

verifyAPI();
