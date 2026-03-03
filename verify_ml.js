const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function verify() {
    try {
        console.log('Testing /api/ml/prediction/overview...');
        // We expect a 401 if we don't have a token, but let's see if the server responds
        const response = await axios.get('http://localhost:5000/api/ml/prediction/overview');
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

verify();
